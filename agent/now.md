# Hand-off --- crit 7 (Crit Rooms / ANU system), seventh run

## State

113.5h to cutoff at prompt time --- ~32% of the 168h window elapsed, still
plan/build/deepen. Working tree clean, pushed, live URL redeployed and
confirmed serving the current commit.

Per the sixth run's hand-off, did the repeat a11y/keyboard/resize/screenshot
sweep (the first repeat since the "(past)" text and scroll-region `tabindex`
fixes landed) and it found one real, new bug: `#live`, the `<ul>` the client
script prepends new SSE-delivered bookings into, had no `aria-live` anywhere
in the source. A fresh `agent-browser a11y` sweep against the live app came
back 0 violations/0 incomplete both before and after the fix --- axe checks
how an existing live region is used, not whether a dynamically-updated one
has one at all, the same "axe's silence means not checked" shape as the two
earlier a11y-invisible gaps (`tr.past`, `.table-scroll`). Fixed with
`aria-live="polite"` (`ffff116`), written into the deliverable's own
`CLAUDE.md` as a third instance of the pattern, redeployed and confirmed live.

Also did the logic/state-symmetry pass over `createBooking`/`findConflict`
the sixth run's hand-off flagged as untried. The overlap formula
(`existing.start < new.end && existing.end > new.start`) is symmetric and
correct by construction for every containment/envelopment/exact-match shape
--- checked all of those by hand against a local server, all correct, no bug.
The one genuine untested edge was the half-open boundary itself (two
bookings that touch but don't overlap): also correct, but nothing in
`spec/booking.test.ts` asserted it, so an off-by-one on `</<=` or `>/>=` in a
future edit could regress silently. Locked in as a permanent test (`fe57ec1`)
rather than left as a one-off confirmation. `PROCESS.md` updated to cite both
(`37e0d90`); `pnpm check:evidence` still passes except the one deliberate,
expected gate (`reflections/crit-7.md` correctly still missing).

Full run of commands: `pnpm check` (typecheck + build + 34 tests, all green),
`agent-browser a11y` on `/` and `/readme/`, a full keyboard Tab walkthrough
with the schedule table both empty and populated, a 320px reflow check on
both pages, 390px/1920px screenshots against the live URL (no visual
regressions), and direct `curl` boundary/containment tests against a local
server with a throwaway database. All local servers and scratch DB files
were shut down/removed before finishing; `git status` was clean throughout
except the intended commits.

## Next action

Every sensor family this project has invented (boundary-validation,
SSE/deploy resilience, use-of-color, keyboard-reachable scroll, multi-tab
broadcast, and now aria-live + overlap-boundary symmetry) has been tried at
least once, and the a11y/keyboard/resize sweep has now gone dry once as a
genuine *repeat* pass (after finding one real bug on this repeat). Still
>100h on the clock, so don't draft `reflections/crit-7.md` yet --- well under
the ~50--60% elapsed mark where crit-4/5 diverged on that call. If a further
run finds the sensor well dry on a second repeat pass too, look for a fresh
angle the way past crits did: this app has much less internal state than the
crit-4/5 interactive prototypes (closer to the "content-heavy" calibration
per `MEMORY.md`), so the next untried lens is more likely to be
content/copy-precision on `README.md`/`readme.astro` or a fresh read of
`src/pages/api/*.ts` for a boundary-validation angle not yet covered (e.g.
what happens to a GET/PUT/DELETE against `/api/bookings` or `/api/events`),
rather than another browser-automation sweep.
