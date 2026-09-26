# Hand-off --- crit 7 (Crit Rooms / ANU system), eleventh run

## State

83.5h to cutoff at prompt time, ~50.3% of the 168h window elapsed --- still
plan/build/deepen. Working tree clean, pushed
([`f5c370f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/f5c370f)),
live URL confirmed serving (200 on `/`) --- this run was docs-only, so no
redeploy was needed.

Resolved the tenth run's two named angles, both confirmed clean rather than
bugs:

- **App-vs-browser input-arbitration family (six real bugs on crit 4/5)
  doesn't apply here.** Confirmed by reading the client script directly:
  `index.astro`'s ten-line `<script>` is one `EventSource` and one `message`
  listener, no keydown/pointer/touch handling at all. Nothing for that bug
  family to attach to.
- **`EventSource` reconnect after a real network blip doesn't leak a stale
  `bus` listener.** Rather than trying to simulate a silent network death
  live (impractical and low-payoff in this sandbox --- a true black-hole
  disconnect with no FIN/RST depends on OS-level TCP retransmission timeouts,
  not anything this app's code controls), read `astro`'s own Node adapter
  (`writeResponse` in `node_modules/astro/dist/core/app/node.js`): it wires
  `destination.on("close", () => reader.cancel())` on the underlying
  `http.ServerResponse` unconditionally. Node fires that `close` event for
  *any* connection teardown --- graceful, forced-kill (already tested live
  on a prior run), or an eventual write failure once TCP gives up on an
  unreachable peer --- so `GET /api/events`'s own `cancel()` (`bus.off`)
  fires on every path, not just the two already tested. Documented both in
  this repo's own `CLAUDE.md` under a new "Resilience" section, plus
  `PROCESS.md`.

`pnpm check` (typecheck + build + 36 tests) green throughout; no app code
changed this run, docs only.

## Next action

Six consecutive runs have now gone dry or turned up only minor gaps across
every sensor family this project has invented: field/HTTP-boundary
validation, SSE/deploy resilience (including reconnect, now closed out),
four axe-invisible a11y gaps, overlap-boundary symmetry, multi-tab
broadcast, copy precision, CI-vs-local config, test-coverage-by-reason-
string, redundant-entry, and now the two angles above. This project is
genuinely closer to the "content/logic well covered, sensor families this
deliverable can support are running dry" state that `comp4020-ass2-dachi`
hit earlier than the interactive crits did (a full-stack app this size has
a smaller surface than a canvas/DOM instrument with lots of custom client
JS to disagree with itself over).

At ~50.3% elapsed, this is right at the boundary where prior deliverables
started drafting their reflection (crit 4 held off at 28%, crit 5 drafted at
61%). Don't draft `reflections/crit-7.md` yet, but the next run should treat
itself as a genuine decision point: if a fresh look (re-read `db.ts`/
`bookings.ts`/`events.ts` end to end once more with fresh eyes, one more full
a11y/keyboard/resize/reload sweep against the live URL) comes back dry too,
that's the cue to draft the reflection and start treating further runs as
light-touch re-verification (a `pnpm check` + a live spot-check) rather than
inventing further narrow technique variants for their own sake --- per the
crit-5 precedent, which did exactly that for its last several runs once the
well was confirmed dry twice over.
