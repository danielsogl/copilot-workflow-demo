import { execFileSync } from "child_process";
import { z } from "zod";
import {
  query,
  tool,
  createSdkMcpServer,
} from "@anthropic-ai/claude-agent-sdk";

const prNumber = process.argv[2];
if (!prNumber || !/^\d+$/.test(prNumber)) {
  console.error("Usage: npm run review-bot -- <PR-number>");
  console.error("Example: npm run review-bot -- 139");
  process.exit(1);
}

const MAX_DIFF_LENGTH = 30_000;

const reviewServer = createSdkMcpServer({
  name: "review",
  version: "1.0.0",
  tools: [
    tool(
      "get_pull_request",
      "Fetch the diff and metadata of a GitHub pull request via the gh CLI.",
      {
        pr: z
          .string()
          .regex(/^\d+$/, "PR number must be numeric")
          .describe("The pull request number"),
      },
      async ({ pr }) => {
        const rawDiff = execFileSync("gh", ["pr", "diff", pr], {
          encoding: "utf-8",
          maxBuffer: 500_000,
        });
        const meta = execFileSync(
          "gh",
          [
            "pr",
            "view",
            pr,
            "--json",
            "title,body,author,additions,deletions,changedFiles",
          ],
          { encoding: "utf-8" },
        );

        const diff =
          rawDiff.length > MAX_DIFF_LENGTH
            ? rawDiff.slice(0, MAX_DIFF_LENGTH) +
              "\n\n... [diff truncated – showing first 30k chars]"
            : rawDiff;

        console.log(
          `\x1b[36m[gh]\x1b[0m fetched PR #${pr} metadata + diff (${diff.length} chars)`,
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ...JSON.parse(meta), diff }, null, 2),
            },
          ],
        };
      },
    ),
  ],
});

const SYSTEM_PROMPT = `You are an expert code reviewer specializing in Angular 21, TypeScript, and NgRx Signals.
When reviewing a pull request:
1. Start with a short summary of what the PR does
2. List concrete issues (bugs, anti-patterns, missing error handling)
3. Suggest specific improvements with code examples where helpful
4. End with an overall verdict: ✅ Approve / ⚠️ Needs Changes / ❌ Request Changes

Always call the get_pull_request tool first to fetch the diff before reviewing — never guess.`;

async function main() {
  console.log(
    `\n🔍 \x1b[1mClaude PR Review Bot\x1b[0m — reviewing PR #${prNumber}...\n`,
  );

  const stream = query({
    prompt: `Please review pull request #${prNumber} in this repository. Fetch it using the get_pull_request tool and provide a thorough but concise code review.`,
    options: {
      model: "claude-opus-4-7",
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: { review: reviewServer },
      allowedTools: ["mcp__review__get_pull_request"],
      maxTurns: 6,
    },
  });

  for await (const msg of stream) {
    if (msg.type === "assistant" && msg.message) {
      for (const block of msg.message.content) {
        if (block.type === "text" && "text" in block) {
          process.stdout.write(block.text);
        } else if (block.type === "tool_use" && "name" in block) {
          console.log(`\n\x1b[32m[tool]\x1b[0m ▶ ${block.name}`);
        }
      }
    } else if (msg.type === "result") {
      const cost =
        "total_cost_usd" in msg && typeof msg.total_cost_usd === "number"
          ? msg.total_cost_usd
          : null;
      const duration =
        "duration_ms" in msg && typeof msg.duration_ms === "number"
          ? msg.duration_ms
          : null;
      console.log(
        `\n\n\x1b[2m[done] ${cost !== null ? `cost=$${cost.toFixed(4)}` : ""} ${duration !== null ? `duration=${duration}ms` : ""}\x1b[0m`,
      );
    }
  }
}

main().catch((err: unknown) => {
  console.error(
    "\x1b[31mError:\x1b[0m",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
