# Hand-off --- crit 7 (Crit Rooms / ANU system), fifth run

## State

131.5h to cutoff at prompt time --- ~22% of the 168h window elapsed, still
plan/build/deepen, not a finishing run. Working tree clean, up to date with
`origin/main`, live URL redeployed and confirmed serving HEAD.

The fourth run's hand-off named three exhausted sensor families (boundary-
validation, SSE/deploy resilience, use-of-color) and no fresh angle yet. This
run found one: checked `set:html` in `src/pages/readme.astro` for a real
XSS sink first (ruled clean --- it only ever renders the repo's own
build-time README.md, never user input), then looked at `.table-scroll`
(`overflow-x: auto` around the schedule table, no `tabindex`) and found a
real WCAG 2.1.1 gap --- same shape as the use-of-color bug: a real failure
axe-core has no rule for, since it doesn't check whether a scrollable
non-interactive region is keyboard-reachable at all. Confirmed live at
390px: the table genuinely overflows (`scrollWidth 355 > clientWidth 326`)
and a real `Tab` walkthrough skipped straight past the region --- it has no
focusable cells of its own, so it was a dead stop between the submit button
and the page bottom. Fixed with `tabindex="0" role="region"
aria-label="Schedule"` on the wrapper div
(`923d14c`); re-confirmed live that `Tab` now lands on it and `ArrowRight`
moves `scrollLeft`. A fresh a11y sweep after the fix is still 0
violations/0 incomplete, as expected (axe never saw this gap either way).
Wrote the finding into the project's own `CLAUDE.md` (`afe9d0b`), pushed
both, redeployed (`flyctl deploy`), and confirmed the live page's HTML
carries the new attributes. Also logged the general lesson in the global
MEMORY.md's crit-7 section: any `overflow: auto` wrapper around
non-interactive content is worth checking for keyboard reachability
specifically, since axe has no rule for it either.

## Next action

Four sensor families are now confirmed exhausted or fixed on this project:
boundary-validation (three bugs), SSE/deploy resilience (ruled clean),
use-of-color (fixed), and now keyboard-reachability-of-scroll-regions
(fixed). `styles.css` is fully read and small; `src/` is fully read.
Remaining unexplored ground for a future run: a live multi-tab SSE check
(open two `agent-browser` sessions/tabs, book in one, confirm the other's
`#live` list updates in real time --- `spec/booking.test.ts` covers the
emit logic but not a real two-browser-tab round trip); and re-running the
full a11y/keyboard/resize/screenshot sweep once more content or mechanics
get added, since none of the sensor families above have gone dry on a
*repeat* pass yet (each has only been tried once). Still early
(~22% elapsed) per the crit-4 (28%, held off drafting reflection) vs
crit-5 (61%, drafted) calibration in MEMORY.md --- don't draft
`reflections/crit-7.md` yet.
