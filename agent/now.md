# Hand-off --- crit 7 (Crit Rooms / ANU system), sixteenth run

## State

41.5h to cutoff at prompt time, still >24h --- not the final run. Working
tree was clean and pushed at
[`392c21e`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/392c21e)
before this run started.

Fetched the course source fresh: brief unchanged. `pnpm check` and
`check:evidence` were clean at the start, matching the prior ten consecutive
dry runs --- but this run followed the prior hand-off's own suggested angle
("malformed/oversized request bodies generally") rather than treating the
well as dry, and it found a real bug, not another confirmed pass.

**The bug:** `@astrojs/node` defaults `bodySizeLimit` to 1GB; `astro.config.ts`
never overrode it. The deployed Fly machine has 256MB of RAM (`fly.toml`),
and a real booking POST is under 1KB even at the form's own 80-char field
caps. Confirmed live against a local production build: baseline RSS ~245MB,
a single 5MB oversized `pod` field pushed it to ~279MB (the raw value gets
buffered, decoded, and --- for a rejected submission --- echoed whole into
the redirect's query string by `withInput`). A 256MB machine has no defense
against a POST far smaller than the 1GB default ever needed to trigger it.

**The fix:** `bodySizeLimit: 64 * 1024` in `astro.config.ts`'s node adapter
options (64KB, generous over any real submission, far below any threat to
the machine). Verified both directions locally and against the redeployed
live app: an 80-char-capped legit booking still succeeds, a 100KB body gets
a clean 500 (empty body, same harmless shape as the earlier malformed-
Content-Type finding) with the server still answering the next request.
Added a regression test in `spec/booking.test.ts`. Commits: `9f2f010` (fix +
test), `bc52b3f` (this repo's `CLAUDE.md`), `18993f2` (`PROCESS.md`
citation). Pushed and redeployed (`flyctl deploy`), confirmed live.

One live-testing wrinkle, handled correctly: the first live verification
POST silently hit a pre-existing conflict (same room/time as an old "Deploy
Check Pod" test row from an earlier run) and inserted nothing --- looked
like success (a followed 303 redirect reads as a 200 to a script that
doesn't set `redirect: manual`) but wasn't actually proof of insertion.
Re-ran against a genuinely free time slot to get a real assertion, then
cleaned up the one row it did insert via `flyctl ssh console` (per the
established practice: a live check that submits through the real form needs
its own cleanup, since this app has no edit/delete). The old "Deploy Check
Pod" row from a prior run was left alone --- not something this run
introduced.

Global `MEMORY.md`'s full-stack section already documents nine related
findings for this project; this is the tenth, and the first to come from
"check a framework default against the actual deployed machine's own
resource limits" rather than the request-shape/method/origin/body-parsing
angles the prior nine covered. Added to that section (see below).

## Next action

Eleventh consecutive light-touch run should keep the same shape (`pnpm
check` + `check:evidence` + live spot-check + fresh course-source read), but
this run is proof the "what could a request that isn't the form send"
question still has unmined variants once framed differently ("is this
default safe *here*, not just in general"). One candidate not yet tried, if
a future run wants a starting point: whether Fly's own proxy or Node's HTTP
server enforces any timeout on a slow-drip request (a client that sends the
64KB body limit's worth of bytes one byte at a time, holding a connection
open) --- a slowloris-shaped question distinct from the raw-size one just
fixed. Whenever the prompt calls a run "last": no finishing steps are
outstanding (site renders, `PROCESS.md` and `reflections/crit-7.md` are both
done and PROCESS.md now cites twelve commits, `CLAUDE.md` is current,
everything's pushed and deployed at the commit just shipped) --- that run
should be a confirm pass only, no redeploy needed unless a further commit
lands first.

## Before you ship

`pnpm check:evidence` verifies that this comment is gone, that your citations
resolve to real commits, that a crit week's reflection entry is in
`reflections/`, and that your `CLAUDE.md` is there. It checks that your account
is traceable, not that it is good: that is the marker's call.

Images aren't checked: unlike a citation whose SHA doesn't resolve, a broken
image is visible the moment this file is rendered on GitHub.
