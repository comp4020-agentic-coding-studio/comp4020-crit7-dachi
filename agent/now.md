# Hand-off --- crit 7 (Crit Rooms / ANU system), final run (seventeenth)

## State

35.5h to cutoff at prompt time; the prompt named this the last run for this
deliverable. Working tree was clean and pushed at
[`900967c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/900967c)
before this run started, matching the deployed live app (Fly release v10,
same image built from `9f2f010`'s body-size-limit fix).

Fetched the course source fresh: brief unchanged (`draft: true`, spec and
body identical to every prior read). Ran the full finishing-steps checklist
per doctrine rather than inventing a new sensor, since the prior run's
hand-off had already confirmed no finishing steps were outstanding:

- `pnpm check` (typecheck + astro check + build + vitest): clean, 37/37
  tests passing, 0 type errors.
- `pnpm check:evidence`: both citations valid --- `reflections/crit-7.md`
  present, `PROCESS.md`'s 12 cited commits all resolve.
- `flyctl status`/`flyctl releases`: live app on release v10, matching
  local `HEAD`'s deploy history exactly --- no drift between what's
  committed and what's served.
- Live URL check: `https://comp4020-crit7-dachi.fly.dev/` returns 200,
  correct title. Real-browser walkthrough (`agent-browser`) of both pages
  (`/` and `/readme/`, the site's only two links) --- both load clean, no
  console errors, `document.title` correct on each.

No new bug found, no fix needed, no new commit --- this run's job was
verification, and it confirmed the deliverable is exactly as done as the
sixteenth run's hand-off said it was. `agent/` untouched (harness-owned, per
doctrine and the two near-misses already logged in `MEMORY.md`).

## Next action

None --- this deliverable is finished. `comp4020-crit7-dachi` closes out at
17 runs total: eleven real bugs/gaps found and fixed across the boundary-
validation family (timestamp shape, pod/tutor length, calendar validity,
unknown-room test gap), the resource-limit family (body size vs. the 256MB
machine), and the axe-invisible a11y family (use-of-color, keyboard-
unreachable scroll region, missing aria-live, redundant-entry-on-rejection)
--- plus several confirmed-clean passes (CSRF/origin boundary, SSE fan-out
to multiple subscribers, SSE-reconnect cleanup via the adapter's own close
wiring, TOCTOU concurrency via the synchronous SQLite driver, malformed
Content-Type handling). `PROCESS.md` and `reflections/crit-7.md` are both
complete and cited; nothing further to write.

A third calibration point alongside Aurora Keys and Swerve, but a different
shape from both: this was the first full-stack deliverable, and the
dominant bug family (boundary/input validation at the HTTP layer, framework
resource defaults) was almost entirely new relative to the two static
prototypes' dominant families (app-vs-browser input arbitration,
multi-writer shared state) --- confirming the working hypothesis that a
deliverable's tech stack, more than raw hours invested, determines which
sensor families are worth inventing first. Worth defaulting future
full-stack deliverables straight to "what could a request that isn't the
form send" and "is this framework default safe on the actual deployed
machine" before reaching for the static-prototype-honed browser-automation
techniques, the same way the content-heavy assignment 2 entry already
recommends raw-content-reads over browser automation for that different
shape of deliverable.

## Before you ship

`pnpm check:evidence` verifies that this comment is gone, that your citations
resolve to real commits, that a crit week's reflection entry is in
`reflections/`, and that your `CLAUDE.md` is there. It checks that your account
is traceable, not that it is good: that is the marker's call.

Images aren't checked: unlike a citation whose SHA doesn't resolve, a broken
image is visible the moment this file is rendered on GitHub.
