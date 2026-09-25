# Hand-off --- crit 7 (Crit Rooms / ANU system), ninth run

## State

96.5h to cutoff at prompt time --- ~42.6% of the 168h window elapsed, still
plan/build/deepen. Working tree clean, pushed, redeployed, live URL confirmed
serving the new commit (`curl` against the live `/api/bookings` with
`roomId=999` returns the new `?error=unknown-room&roomId=999` redirect).

Followed the eighth run's hand-off: the two untried angles it named both
resolved as real, if minor, gaps rather than confirms.

- **`PRAGMA foreign_keys`**: confirmed never enabled in `src/lib/db.ts`, so
  `bookings.room_id`'s declared `FOREIGN KEY` (present in the migration SQL)
  was decorative --- SQLite doesn't enforce a foreign key unless a connection
  turns it on for itself. Not exploitable via the app's one insert path
  (`createBooking` already checks room existence before insert), so this is a
  safety net for a future write path, not a live-bug fix. Enabled with one
  line (`b4aab3d`).
- **CI workflow vs. local commands**: read `.github/workflows/checks.yml` in
  full for the first time. It does substantially more than `pnpm check` +
  `flyctl deploy` by hand once public --- it also live-verifies the deployed
  site is online, the SSE endpoint streams, the app correctly detects HTTPS
  behind Fly's proxy (via `astro.config.ts`'s `allowedDomains`, already
  configured), CSRF protection is still on, and internal links resolve.
  Cross-checked each assumption the workflow's own comments make against the
  actual app config: all confirmed already correct, no gap. A genuine dry
  pass on this specific angle, not skipped.
- **A third gap, found by a new technique** (not one either hand-off flagged):
  grepped `spec/booking.test.ts` for each of `createBooking`'s five
  `CreateBookingResult["reason"]` strings rather than re-reading the
  validation logic by eye --- `unknown-room` had no regression test, the
  only one of five without one. Added it (`7c26402`); all 35 tests
  (up from 34) pass, and the live redeploy confirms the branch really is
  reachable and correctly wired end to end, not just type-correct.

Documented both fixes plus the reason-string-checklist technique in this
repo's own `CLAUDE.md` (`74e8658`).

`pnpm check` (typecheck + build + 35 tests) green throughout.
`pnpm check:evidence` still fails only on the one deliberate, expected gate
(`reflections/crit-7.md` correctly still missing this early).

## Next action

Three consecutive runs have now gone dry or turned up only minor gaps across
every sensor family this project has invented (field-level and HTTP-boundary
validation, SSE/deploy resilience, three axe-invisible a11y gaps,
overlap-boundary symmetry, multi-tab broadcast, copy precision, CI-vs-local
config, and now a test-coverage checklist by reason string). Still well
under the ~50--60% elapsed mark where prior deliverables drafted their
reflection early (42.6% now) --- don't draft `reflections/crit-7.md` yet, but
it's getting closer; the next run or two should probably decide.

Angles not yet tried, worth reaching for before assuming the well is fully
dry: (1) the reason-string-checklist technique generalises --- check whether
`spec/invariants.test.ts` (the starter's own file, never audited this way by
this project) has a similar per-branch gap against whatever contract it
states; (2) `src/lib/events.ts`'s `EventEmitter` has no explicit
`setMaxListeners` --- Node warns past 10 listeners by default; check whether
a burst of concurrent SSE subscribers (more than 10 real tabs) would emit
that warning to the deployed app's logs, which would be cosmetic but still a
real polish gap; (3) if both come back clean, that's the fourth dry pass and
probably the point to start treating runs as light-touch re-verification
(per the crit-5 precedent for its runs 9--16) while watching the elapsed
fraction for when to draft the reflection.
