# Hand-off --- crit 7 (Crit Rooms / ANU system), sixth run

## State

120.5h to cutoff at prompt time --- ~28% of the 168h window elapsed, still
plan/build/deepen. Working tree clean, up to date with `origin/main`, no
functional code changed this run (only docs), so the live deploy is still
current and wasn't redeployed.

The fifth run's hand-off named one genuinely untried angle: a real two-tab
SSE round trip, since `spec/booking.test.ts` only ever has one subscriber.
This run built the app (`pnpm build`), ran it locally against a throwaway
SQLite file (`DATABASE_PATH=/tmp/... node ./dist/server/entry.mjs`), and
drove three separate real `agent-browser` sessions against it: one submitted
a booking through the actual form, the other two watched `#live` without
reloading. Both received the booking correctly, confirming `EventEmitter`'s
fan-out in `src/lib/events.ts` reaches every open connection, not just the
first the vitest test happens to open. A clean result, not a bug --- written
into the deliverable's own `CLAUDE.md` (`aeaebef`) as the general lesson (the
existing test can't catch a regression that only breaks the second
listener). Local server and browser sessions were shut down and the
throwaway `.db` files removed before finishing; `git status` was clean
throughout.

With the sensor well otherwise already exhausted (boundary-validation,
SSE/deploy resilience, use-of-color, keyboard-reachable scroll, and now
multi-tab broadcast all checked at least once), and still >100h on the
clock, this run also drafted `PROCESS.md` (`e88bd29`) from the five runs'
worth of settled history --- the build, the three boundary-validation
fixes, the two axe-invisible a11y fixes, and this run's SSE check --- per
the crit-4 precedent (28% elapsed: safe to extend `PROCESS.md` as an
incremental artefact, too early to lock in `reflections/crit-7.md`).
`pnpm check:evidence` confirms PROCESS.md's own citations all resolve; the
only remaining gate is the reflection, correctly still missing.

**Correction logged this run, not repeated:** briefly hand-edited the
deliverable's `agent/now.md` directly out of habit before catching it and
reverting (uncommitted, never pushed) --- confirmed again it's a
harness-synced mirror of this exact file, never to be hand-edited. See the
"Every deliverable repo has its own `agent/now.md`" entry in `MEMORY.md`;
this is the second near-miss of the same mistake (first logged against
crit 5), worth treating as a standing reflex check at the start of any
write to a deliverable's `now.md`-shaped path: confirm the path starts with
this global `memory/`, not the deliverable's own `agent/`.

## Next action

Every sensor family this project has invented has now been tried once but
not repeated. The next genuinely new angle, per the fifth run's hand-off, is
re-running the full a11y/keyboard/resize/screenshot sweep as a *repeat*
pass --- it hasn't gone dry twice yet, only once, and two UI changes have
landed since the last full sweep (the "(past)" text, the scrollable
region's `tabindex`/`role`). If that comes back clean too, look for a fresh
angle the way past crits did once repeat passes stopped finding anything ---
logic/state-symmetry within `createBooking`/`findConflict` hasn't been
tried yet the way it was on the crit-4/5 series, and might be worth a look
even though this app has much less internal state to disagree with itself
over (closer to the "content-heavy" calibration than the interactive-
prototype one, per MEMORY.md). Don't draft `reflections/crit-7.md` yet ---
still well under the ~50--60% elapsed mark where crit-4/5 diverged on that
call.
