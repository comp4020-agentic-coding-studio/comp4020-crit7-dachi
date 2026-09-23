# Hand-off --- crit 7 (Crit Rooms / ANU system), second run

## State

155.5h to cutoff at prompt time --- still well inside "plan/build/deepen,"
not a finishing run. Continued from the first run's hand-off, which had
flagged two specific untried sensor families.

This run:

1. Confirmed the SSE bus's single-process assumption
   (`src/lib/events.ts`'s comment: "only works because the app runs on
   exactly one machine") is actually enforced, not just asserted: `flyctl
   status`/`flyctl scale show -a comp4020-crit7-dachi` both show exactly one
   machine, one VM group, count 1 --- consistent with the mounted volume
   (`fly.toml`'s `[mounts]`) constraining placement to a single machine
   anyway. No bug, no fix needed; a confirmed pass, not a null result.
2. Found and fixed a real boundary-validation gap in the same shape as the
   prior run's timestamp fix: `createBooking` (`src/lib/db.ts`) never
   bounded `pod`/`tutor` length server-side, relying entirely on the form's
   `maxlength="80"` --- a browser-side courtesy a direct POST can bypass
   the same way `startsAt=banana` bypassed the timestamp shape check.
   Confirmed reachable with a raw `curl` POST of an 81-char pod name before
   fixing (stored unboundedly, no edit/delete to ever clear it). Fix: a
   `MAX_TEXT_LENGTH = 80` check in `createBooking`, a new `too-long` result/
   error message, a regression test in `spec/booking.test.ts`. Committed
   (`e6f1fb2`), redeployed, and re-confirmed live against the actual
   `https://comp4020-crit7-dachi.fly.dev/` URL (not just the local build)
   that the malformed POST now redirects to `?error=too-long` and the page
   renders the right message.
3. `PROCESS.md` is still the unfilled template, `reflections/` still empty
   --- correct for this point in the week.

## Next action

Both sensor families the first run's hand-off named are now closed out (one
confirmed clean, one found and fixed a real bug). Sensor families not yet
tried on this project: re-read the SSE/events route (`src/pages/api/
events.ts`, not yet read closely this run) for its own asymmetry --- does a
client disconnect actually unregister its listener from `bus`, or could a
long-lived series of dropped SSE connections leak listeners over the app's
lifetime (`bus.setMaxListeners(0)` in events.ts suppresses the warning that
would normally surface this, which is itself worth checking isn't masking a
real leak). Also not yet tried: a full keyboard/a11y/resize sweep against
the *redeployed* live URL specifically (last run's sweep was against the
local build before the first deploy) --- cheap to re-run once, since the
app has had two commits since. Don't re-run the same checks a third time
without a new question once these two are exhausted; watch fraction of the
168h window elapsed (see MEMORY.md's crit-4/crit-5 calibration notes) before
deciding whether to keep inventing new sensors or start drafting PROCESS.md/
reflections/crit-7.md early.
