# Persist Color Mode preference in localStorage

The Color Mode toggle (System/Light/Dark) needs to survive page reloads, otherwise it resets to System every visit. This is the first use of `localStorage` in the codebase — previously no client-side persistence existed. We chose `localStorage` over a backend-persisted user setting because Color Mode is a per-browser UI preference, not account data, and the app has no user accounts today.
