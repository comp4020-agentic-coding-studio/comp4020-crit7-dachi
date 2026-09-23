# Hand-off --- crit 7 (Crit Rooms / ANU system), third run

## State

144.5h to cutoff at prompt time --- still well inside "plan/build/deepen"
(~14% of the 168h window elapsed), not a finishing run.

This run closed out both sensor families the second run's hand-off had
flagged as untried, then kept going while the vein was still producing:

1. **SSE listener leak, checked and confirmed clean.** Temporary
   `console.error` instrumentation in `src/pages/api/events.ts`
   (reverted before committing, `git status` clean throughout) plus a
   locally-built-and-run server showed every disconnect shape --- a
   graceful `curl -m 1` timeout, an abrupt `kill -9` of the client, three
   concurrent connections with one killed --- correctly dropped
   `bus.listenerCount("booking")`. No leak; full detail in MEMORY.md.
2. **Live-URL keyboard/a11y/resize sweep, confirmed clean.** 0 a11y
   violations/incomplete, sensible landmark/heading structure, full
   `Tab`-walked focus order with no trap, no overflow at 320px/390px,
   in-progress form state survives a mid-interaction resize.
3. **Found and fixed a third real boundary-validation gap:** `TIME_SHAPE`
   checked digit shape only, not that the day fits the month ---
   `2031-02-30T09:00` passed and was stored forever. Fixed with a
   leap-year-aware day check, proved with a test that failed before the
   fix and passed after (all 33 tests green). Committed `a7217d4`,
   redeployed, re-confirmed live with a raw `curl` POST against the real
   URL.
4. **Checked two further candidates in the same family and ruled both
   out:** `roomId` type coercion (`1.5`, `1e2`, `Infinity`, `0`, `-1`,
   `abc` all correctly rejected) and a `findConflict`-then-insert TOCTOU
   race (ten truly concurrent overlapping POSTs for the same room/time ---
   exactly one won). Both confirmed passes, not bugs --- full reasoning
   (why synchronous better-sqlite3 + no `await` between the two statements
   already closes the race) in MEMORY.md.
5. Pushed (`b661756..a7217d4`). `PROCESS.md` still the unfilled template,
   `reflections/` still empty --- correct at 14% elapsed.

## Next action

The boundary-validation vein (three real bugs so far: timestamp shape,
pod/tutor length, calendar-date validity) has now had its two most obvious
remaining candidates checked and ruled clean (roomId coercion, insert
race) --- treat it as exhausted unless a fresh angle occurs to a future
run, rather than re-deriving the same three checks again. SSE and browser-
level sensors are also confirmed clean as of this run. Sensor families not
yet tried on this project, worth reaching for next: (a) the SSE stream's
own resilience --- does a client that reconnects after a dropped connection
miss any bookings made while it was disconnected (there's no replay/buffer,
only live broadcast --- is that a real gap against the brief's "the core
flow persists across a reload" promise, or out of scope since a reload
already re-fetches the full schedule fresh?); (b) whether the Dockerfile's
multi-stage build and the `drizzle/` migration-at-boot path actually
survive a real `flyctl deploy` from a clean state matching what's on disk
(differs from the local `pnpm build`/`pnpm test` path, which never
touches the Fly volume or the committed migrations the same way boot
does). Keep watching fraction of the 168h window elapsed before deciding
whether to keep inventing sensors or start drafting PROCESS.md/
reflections/crit-7.md --- 14% elapsed this run is still early, per the
crit-4 (28%, held off) vs crit-5 (61%, drafted) calibration in MEMORY.md.
