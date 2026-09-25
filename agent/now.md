# Hand-off --- crit 7 (Crit Rooms / ANU system), eighth run

## State

107.5h to cutoff at prompt time --- ~36% of the 168h window elapsed, still
plan/build/deepen. Working tree clean, pushed. Live URL confirmed serving
(machine autostarted on request after being idle-stopped, both `/` and
`/readme/` 200).

Followed the seventh run's hand-off: tried the two fresh lenses it named
(API HTTP-method boundary, README/copy precision) rather than repeating a
browser-automation sweep, since that had just gone dry once as a genuine
repeat pass.

- **HTTP method/CSRF boundary**: probed `GET /api/bookings` and
  `POST`/`PUT`/`DELETE /api/events` directly against a local server with a
  scratch DB. `GET`/unimplemented methods 404 (Astro's default, no handler
  exported); any unsafe method whose `Origin` header doesn't match the
  request's own origin 403s ("Cross-site ... forbidden") --- Astro's
  built-in same-origin check, already known to and deliberately worked
  around by `spec/booking.test.ts`'s own `post()` helper (sets a matching
  `Origin`, with a comment explaining why). Confirmed clean, not a bug:
  the app's field-level revalidation (already hardened over four earlier
  runs: timestamp shape, calendar validity, text length) and this
  framework-level method/origin boundary are two separate layers, and
  both are now checked rather than assumed. Documented in this repo's own
  `CLAUDE.md` and `PROCESS.md` (`e040b34`).
- **Copy precision**: read `README.md`, `readme.astro`, and `index.astro`
  fresh end to end, cross-checked every claim (persistence, conflict
  rejection, the half-open boundary, the error-code-to-copy mapping in
  `ERROR_TEXT`) against `spec/booking.test.ts` and `spec/invariants.test.ts`
  line by line. Everything matched --- no copy/behaviour drift found.

Both lenses came back clean; this is a docs-only commit (no app-code
change), so no redeploy was needed --- confirmed the already-running
commit still serves correctly instead.

`pnpm check` (typecheck + build + 34 tests) green throughout.
`pnpm check:evidence` still fails only on the one deliberate, expected gate
(`reflections/crit-7.md` correctly still missing this early).

## Next action

Two consecutive runs have now gone dry across every sensor family this
project has invented (boundary-validation at the field level, HTTP
method/CSRF boundary, SSE/deploy resilience, three axe-invisible a11y
gaps, overlap-boundary symmetry, multi-tab broadcast, copy precision) ---
worth treating as a real signal, per the assignment-1/crit-4/crit-5
precedent, that the seam here is thinning. Still well under the ~50--60%
elapsed mark where those prior deliverables drafted their reflection
early (36% now), so don't draft `reflections/crit-7.md` yet.

Untried angles worth a further run before assuming there's truly nothing
left: (1) the Dockerfile/CI workflow itself --- read `.github/workflows/`
if present and confirm the automated deploy/check gate actually matches
what `flyctl deploy`/`pnpm check` do by hand, since no prior run has
cross-checked CI config against local commands directly; (2) whether
`PRAGMA foreign_keys` is ever turned on in `src/lib/db.ts` --- it isn't
currently, so the `bookings.roomId` FK to `rooms` is declarative only, not
DB-enforced; not exploitable via the app's one insert path (`createBooking`
already checks room existence first), but worth a deliberate one-line
note or fix rather than leaving it unexamined since it's a genuine gap
between the schema's stated constraint and the database's actual
behaviour; (3) if both of those come back clean too, that's a third dry
pass and the next move is probably to keep the project ticking over with
light-touch re-verification (per the crit-5 precedent for runs 9--16)
until either something changes or the reflection becomes due.
