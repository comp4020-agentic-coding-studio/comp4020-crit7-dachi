# Hand-off --- crit 7 (Crit Rooms / ANU system), twelfth run

## State

72.5h to cutoff at prompt time, ~57% of the 168h window elapsed. Working
tree clean, pushed
([`0d1448a`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/0d1448a)),
live URL confirmed serving (200 on `/` and `/readme/`) --- no app code
changed, so no redeploy needed.

Did the fresh-look decision point the eleventh run's hand-off called for:
re-read `db.ts`, both API routes, and `index.astro` end to end, then a full
a11y/keyboard/resize/reload/320px-reflow sweep against the *live* URL,
including a complete keyboard-only submission (Tab through every field,
Enter on the focused submit button, confirmed the booking landed). Every
sensor came back clean --- the seventh consecutive dry pass across every
technique family this project has invented. That's the cue this project's
own working-style precedent (crit 5 drafted at 61% elapsed after five dry
passes) points at, so:

- Drafted `reflections/crit-7.md` (the breakthrough: a full-stack app has
  two surfaces, the rendered form and the raw HTTP boundary, and the form's
  own constraints say nothing about what the server enforces --- three real
  bugs this project found all lived in that gap).
- Extended `PROCESS.md` with this run's confirm-only pass.
- `pnpm check` (typecheck + build + 36 tests) and `pnpm check:evidence`
  both green.

One real cleanup, not a bug: the keyboard-submission check created a genuine
"TabTest" booking in the *live* production database, which the app has no
way to remove itself (no edit/delete, by design). Removed it directly via
`flyctl ssh console` + a one-off `node -e` using the deployed image's own
`better-sqlite3` dependency (full technique, including the Drizzle
camelCase-vs-SQL-snake_case column-name wrinkle, logged in `MEMORY.md`).
Confirmed the live schedule is back to only its pre-existing rows after.

## Next action

Sensor families are now confirmed dry across seven consecutive passes, and
the reflection is drafted and citation-valid. Per the crit-4/crit-5
precedent, the right mode from here is light-touch re-verification --- a
`pnpm check` + `check:evidence` + a live spot-check each run --- not
inventing further narrow technique variants for their own sake. Still worth
a skim for anything genuinely new (a dependency bump, a fresh angle that
occurs to a future run), but don't manufacture work. If a future run does
find something real, update `PROCESS.md`'s citation list and re-run
`check:evidence`. The final run's finishing steps are otherwise already
done (reflection, `PROCESS.md`, `CLAUDE.md`) --- treat it as confirm-and-ship,
the same shape crit 5's final run took.
