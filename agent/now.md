# Hand-off --- crit 7 (Crit Rooms / ANU system), fifteenth run

## State

48.5h to cutoff at prompt time, still >24h --- not the final run. Working
tree was clean and pushed at
[`6d5ad9a`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/6d5ad9a)
before this run started.

Fetched the course source (`crits/07-anu-system.json`) fresh: brief unchanged
from what's already built.

`pnpm check` (typecheck, build, 36 tests), `pnpm check:evidence`, and a live
spot-check (`flyctl status` --- machine `stopped` on normal autostop, `curl`
on `/` and `/readme/` both 200) all clean, as in the prior nine consecutive
dry runs.

This run found one genuinely new (not previously checked) angle before
confirming clean: whether `POST /api/bookings`'s unconditional
`request.formData()` call, which throws on a non-form `Content-Type`, could
crash the server or leak a stack trace via its 500. Checked against a
locally-run **production** build (`NODE_ENV=production`, matching the
Dockerfile) with a JSON-`Content-Type` POST --- empty 500 body, no leak, next
request served normally. No fix needed, a confirmed pass. Logged in both this
repo's `CLAUDE.md` (Resilience section) and the global `MEMORY.md`'s
full-stack section, and committed
([`a05050f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/a05050f),
pushed).

## Next action

Tenth consecutive dry pass overall, first new angle found in several runs.
Keep the light-touch shape (`pnpm check` + `check:evidence` + live spot-check
+ fresh course-source read) each run, but before falling back to a pure
confirm-only pass, spend one cheap pass looking for an angle not yet in
`CLAUDE.md`'s history --- this run's malformed-Content-Type check shows the
well isn't fully dry yet, just thinning. Candidate angles not yet tried, if a
future run wants a starting point rather than re-deriving from scratch:
malformed/oversized request bodies generally (very large `pod`/`tutor` field
sent as raw bytes rather than through the length check, to confirm no
memory/DoS issue at the Node/Astro layer before the app's own 80-char check
even runs), or whether the seeded room list (`rooms` table, presumably 4 rows)
has any edge case around room count changing. Whenever the prompt calls a run
"last": no finishing steps are outstanding (site renders, `PROCESS.md` and
`reflections/crit-7.md` are both done, `CLAUDE.md` is current, everything's
pushed and deployed) --- that run should be a confirm pass plus a final
`flyctl deploy` only if commits have accumulated since the last deploy that
touch runtime code (this run's commit is docs-only, no redeploy needed).

## Before you ship

`pnpm check:evidence` verifies that this comment is gone, that your citations
resolve to real commits, that a crit week's reflection entry is in
`reflections/`, and that your `CLAUDE.md` is there. It checks that your account
is traceable, not that it is good: that is the marker's call.

Images aren't checked: unlike a citation whose SHA doesn't resolve, a broken
image is visible the moment this file is rendered on GitHub.
