# Hand-off --- crit 7 (Crit Rooms / ANU system), tenth run

## State

~89h to cutoff at prompt time (89.5h stated), ~47% of the 168h window
elapsed --- still plan/build/deepen. Working tree clean, pushed, redeployed,
live URL confirmed serving the new commit (a live `curl` POST against
`/api/bookings` with a deliberately bad room id now gets the resubmitted
fields back in the redirect's `Location` header, and the served page renders
them correctly, HTML-escaped).

The ninth run's hand-off named two untried angles; both resolved as clean
confirms, not bugs:

- `spec/invariants.test.ts`'s fixed per-route checklist doesn't generalise
  the reason-string-checklist technique the way the hand-off guessed --- it's
  not a discriminated union to grep for members, it's a flat list of
  assertions applied uniformly via `ROUTES`. Checked `routes.ts` covers every
  real page (`/`, `/readme/`) and the two API endpoints correctly aren't
  page routes needing HTML invariants. Nothing to fix.
- `src/lib/events.ts`'s `bus` already calls `setMaxListeners(0)` (unlimited),
  so a burst of concurrent SSE subscribers was never going to emit Node's
  default-10-listener warning. Already handled, not a live gap.

That's the fourth dry/near-dry pass in a row on the established sensor
families, so this run tried a fresh angle instead of re-running any of
them: read `src/lib/db.ts`'s `createBooking` end to end for anything the
"what could a request that isn't the form send" lens hadn't already asked,
and separately drove the real form into a rejection with `agent-browser` to
see what happens next, rather than just what the server accepts/rejects.
That found a real one --- **WCAG 2.2 SC 3.3.7 (Redundant Entry)**: any
rejected submission (conflict, bad-range, too-long, ...) redirected to a
blank form. The server already had every field; the page just never read
them back, so a real person had to retype the whole booking over one bad
field. Confirmed live before touching source (fill the form, submit into a
genuine conflict, read the fields back after the 303 --- empty every time),
fixed by threading the submitted fields through the redirect's query string
(`withInput` in `api/bookings.ts`) and refilling `value=`/`selected` from
them in `index.astro` (commit `316d491`), covered with a new regression
test plus updated the six existing rejection tests to check individual
params instead of the whole query string, since the fix legitimately adds
params to every one of them (`5961468`). Confirmed via `agent-browser`:
special characters (`&`, `'`) round-trip correctly HTML-escaped, a
non-default room selection persists, a fresh a11y sweep of the
now-repopulated error state is still 0 violations/0 incomplete. Documented
in this repo's own `CLAUDE.md` as a fourth axe-invisible gap, distinct in
shape from the first three: those three are markup that's always present
but wrong; this one is markup that's only wrong on one specific navigation
(a failed POST's redirect), so an axe sweep of the form's resting state
was never going to see it (`106d342`).

Hit one process-hygiene snag worth flagging for future runs: after a
rebuild, killing a background dev server with `kill %1` silently no-ops
across separate Bash tool calls (each call is its own shell, job-control
table doesn't carry over) --- the stale server kept answering requests on
the same port under the *old* build, giving a false "fix isn't working"
signal for a few minutes until `pgrep -af entry.mjs` + `kill <pid>` cleared
it. Use PID-based kill, not `%1`, when restarting a manually-launched
server across tool calls in this harness.

`pnpm check` (typecheck + build + 36 tests, up from 35) green throughout.
`pnpm check:evidence` still fails only on the one deliberate, expected gate
(`reflections/crit-7.md` correctly still missing this early).

## Next action

Five consecutive runs have now gone dry or turned up only minor-to-moderate
gaps across every sensor family this project has invented (field-level and
HTTP-boundary validation, SSE/deploy resilience, four axe-invisible a11y
gaps, overlap-boundary symmetry, multi-tab broadcast, copy precision,
CI-vs-local config, test-coverage-by-reason-string, and now
redundant-entry). Still under the ~50--60% elapsed mark where prior
deliverables drafted their reflection (47% now, similar to crit 4's 28% and
short of crit 5's 61%) --- don't draft `reflections/crit-7.md` yet.

Angles not yet tried, worth reaching for next: (1) the "does the app fight
the browser's own input handling" family (modifier-key hijack, focus-stealing
keydown, pointer-button checks) that found six real bugs across crits 4/5 ---
this project has almost no custom client JS (`index.astro`'s script is ~10
lines, just an `EventSource` listener with no keydown/pointer handling at
all), so it may genuinely not apply here, but worth a deliberate five-minute
check rather than assuming; (2) whether the live-feed script's `EventSource`
reconnects correctly and without duplicating listeners if the connection
drops and the browser's native auto-reconnect kicks in (a real network blip,
not just a graceful/forced-kill client disconnect on the *server* side,
which is already checked) --- a distinct question from the server-side
listener-leak check already done; (3) if both come back clean, this project
may be genuinely closer to "content/logic well covered, sensor families
this deliverable can support are running dry" the way `comp4020-ass2-dachi`
(a differently-shaped, content-heavy deliverable) hit earlier than the
interactive crits did --- start treating runs as lighter-touch
re-verification while watching the elapsed fraction for when to draft the
reflection, rather than inventing further narrow technique variants for
their own sake.
