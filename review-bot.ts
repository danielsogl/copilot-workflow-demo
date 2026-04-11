import { execSync } from "child_process";
import { CopilotClient, approveAll, defineTool } from "@github/copilot-sdk";

const prNumber = process.argv[2];
if (!prNumber) {
  console.error("Usage: npm run review-bot -- <PR-number>");
  console.error("Example: npm run review-bot -- 139");
  process.exit(1);
}

interface GetPullRequestParams {
  pr: string;
}

const MAX_DIFF_LENGTH = 30_000;

const getPullRequest = defineTool<GetPullRequestParams>("get_pull_request", {
  description:
    "Fetch the diff and metadata of a GitHub pull request using the GitHub CLI.",
  parameters: {
    type: "object",
    properties: {
      pr: { type: "string", description: "The pull request number" },
    },
    required: ["pr"],
  },
  skipPermission: true,
  handler: async ({ pr }) => {
    const rawDiff = execSync(`gh pr diff ${pr}`, {
      encoding: "utf-8",
      maxBuffer: 500_000,
    });
    const meta = execSync(
      `gh pr view ${pr} --json title,body,author,additions,deletions,changedFiles`,
      { encoding: "utf-8" },
    );

    const diff =
      rawDiff.length > MAX_DIFF_LENGTH
        ? rawDiff.slice(0, MAX_DIFF_LENGTH) +
          "\n\n... [diff truncated – showing first 30k chars]"
        : rawDiff;

    console.log(
      `Fetched PR #${pr} metadata and diff (length: ${diff.length} chars)`,
    );

    return { ...JSON.parse(meta), diff };
  },
});

async function main() {
  const client = new CopilotClient();

  try {
    const session = await client.createSession({
      model: "claude-sonnet-4.6",
      streaming: true,
      tools: [getPullRequest],
      systemMessage: {
        content: `You are an expert code reviewer specializing in Angular 21, TypeScript, and NgRx Signals.
When reviewing a pull request:
1. Start with a short summary of what the PR does
2. List concrete issues (bugs, anti-patterns, missing error handling)
3. Suggest specific improvements with code examples where helpful
4. End with an overall verdict: ✅ Approve / ⚠️ Needs Changes / ❌ Request Changes`,
      },
      onPermissionRequest: approveAll,
    });

    session.on("assistant.message_delta", (event) => {
      process.stdout.write(event.data.deltaContent ?? "");
    });

    console.log(
      `\n🔍 \x1b[1mCopilot PR Review Bot\x1b[0m — reviewing PR #${prNumber}...\n`,
    );

    await session.sendAndWait({
      prompt: `Please review pull request #${prNumber} in this repository. Fetch it using the tool and provide a thorough but concise code review.`,
    });

    console.log("\n");
    await session.disconnect();
  } finally {
    await client.stop();
  }
}

main().catch((err: unknown) => {
  console.error(
    "\x1b[31mError:\x1b[0m",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
