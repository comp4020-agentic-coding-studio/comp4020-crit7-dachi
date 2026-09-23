# Hand-off --- crit 7 (Crit Rooms / ANU system), first run of this crit

## State

`comp4020-crit7-dachi` arrived with substantial work already done (not by
this run): schema (rooms/bookings), the booking API, SSE live feed, the form
+ schedule page, README and CLAUDE.md rewritten for the domain, and the
starter's guestbook test replaced with `spec/booking.test.ts`. 161.5h to
cutoff at prompt time --- well inside the "plan/build/deepen" band, not a
finishing run.

This run:

1. Ran `pnpm check` (typecheck + build + 30 tests, all green) and a full live
   walkthrough with `agent-browser` against the local build: real form
   submission → persists on reload, a second "tab" (a plain `curl` POST)
   shows up live in the first tab's SSE feed, an overlapping booking through
   the real form gets refused with the right on-page error, full keyboard
   tab order reaches every field and the submit button (a `datetime-local`
   input's internal segments tab within the element before moving on --- not
   a bug), 320px reflow clean, 0 a11y violations including the untested
   error-banner and `.past`-row states.
2. Deployed to Fly for the first time (`flyctl status` showed the app
   existed but had no image yet) --- `flyctl deploy --remote-only --ha=false
   -a comp4020-crit7-dachi`. Live URL confirmed serving 200, and the core
   reload-persists-a-booking flow re-verified against the actual deployed
   URL, not just the local build.
3. Found and fixed a real bug: `createBooking` revalidates room id and
   start/end ordering server-side (per this project's own `CLAUDE.md`), but
   never checked the timestamp *shape* before the lexicographic comparisons
   that ordering/overlap logic depends on. A direct POST (not through the
   form) with `startsAt=banana&endsAt=zebra` was silently accepted and
   persisted forever, since the app has no edit/delete. Confirmed reachable
   with a raw `curl` POST before fixing. Fix: a regex shape check
   (`TIME_SHAPE` in `src/lib/db.ts`) rejecting anything that isn't
   `YYYY-MM-DDTHH:mm` with in-range components, a new `bad-format` result/
   error message, and a regression test in `spec/booking.test.ts`.
   Committed (`cd0c793`), pushed, redeployed, and re-confirmed live that the
   same malformed POST now redirects to `?error=bad-format` instead of
   corrupting the schedule.
4. `PROCESS.md` is still the unfilled template and `reflections/` is empty
   --- correct for this point in the week; doctrine's finishing steps are
   for the last run, not this one.

## Next action

Keep deepening while cutoff allows. Sensor families not yet tried on this
project: a logic-symmetry pass over `db.ts`/the API route for other
boundary-validation gaps in the same shape as the timestamp one (e.g. is
`pod`/`tutor` length actually bounded server-side, not just via the form's
`maxlength`, which is client-only and trivially bypassed the same way the
timestamp shape was); a check of whether the SSE bus's single-process
assumption (`src/lib/events.ts`, explicit comment: "only works because the
app runs on exactly one machine") is actually guaranteed by `fly.toml`'s
`min_machines_running = 0` / single-machine config, not just asserted in a
comment. Don't re-run the same browser sweep again without a new question ---
this run's a11y/keyboard/resize/reload/SSE checks all came back clean once
already.
