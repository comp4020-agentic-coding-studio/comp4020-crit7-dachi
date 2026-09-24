# Hand-off --- crit 7 (Crit Rooms / ANU system), fourth run

## State

137.5h to cutoff at prompt time --- ~18% of the 168h window elapsed, still
plan/build/deepen, not a finishing run.

This run checked the two sensor angles the third run's hand-off had flagged
as untried, and both resolved clean by reading the architecture/deploy
history rather than needing a live simulation (full reasoning in MEMORY.md):

1. SSE reconnect gap --- not a bug. The schedule table is server-rendered
   fresh from SQLite on every request, independent of the SSE bus; the
   `#live` list is explicitly a best-effort "other tabs" notification, not
   the persistence layer, so it not replaying missed events is by design.
2. Docker/migration-at-boot survives a real deploy from clean state ---
   already proven by this project's own history (the first-ever deploy did
   exactly this from zero, three more deploys since have re-applied the
   migrator against the live volume with no issue). Not worth destroying
   the live volume to re-prove it.

With that vein and the boundary-validation vein (three bugs, two ruled-out
candidates, per the third run's hand-off) both quiet, tried a genuinely new
angle: **what UI state is conveyed by a CSS class alone, with no non-visual
signal.** Found a real one --- `tr.past { color: #595959 }` was the *only*
way a finished booking differed from an upcoming one; no text, no ARIA.
This is a WCAG 1.4.1 (use of color) failure, invisible to axe-core in any
mode (jsdom or real browser) because axe has no rule that judges what a
colour means --- it's why the earlier live `agent-browser a11y` sweep (run
3) came back clean despite the bug being real. Fixed by appending literal
" (past)" text next to the end time in `src/pages/index.astro` (a visible
label, not an `sr-only` span, since 1.4.1 needs the signal available to
everyone who can't perceive the colour, not just screen-reader users).
Confirmed by rendering the built server against a scratch SQLite file
seeded with one past and one future booking and diffing the HTML, not by
code-reading alone. Committed (`e5282e2`), redeployed, re-confirmed live
a11y still 0 violations/incomplete (unchanged, as expected --- axe never
saw this either way). Also wrote the lesson into the project's own
`CLAUDE.md` (`81184ef`) as a new "Accessibility" section, and pushed both.

## Next action

Three sensor families are now confirmed exhausted on this project:
boundary-validation (three bugs, `roomId` coercion and insert-race ruled
clean), SSE/deploy resilience (both ruled clean this run), and use-of-color
(one bug fixed; also checked the stylesheet's only other state-bearing
class, `.error`, and ruled it clean --- its colour/background is
reinforcement on top of the `role="alert"` paragraph's own text, which is
the real signal, so removing the colour would still leave the meaning
intact). `styles.css` is small enough (under 90 lines) that this check is
now genuinely exhausted, not just under-explored. Beyond that, no fresh
angle has occurred to this run yet. Keep watching fraction of the 168h
window elapsed
(now ~18%) before deciding whether to keep inventing sensors or start
drafting `PROCESS.md`/`reflections/crit-7.md` --- still early per the
crit-4 (28%, held off) vs crit-5 (61%, drafted) calibration in MEMORY.md.
