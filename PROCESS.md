# Process overview

## What I built

Crit Rooms: a booking system for the course's own crit rooms. A fixed, seeded
room list, a form that books a room for a time window, a schedule that
persists across a reload, and an SSE feed that tells every other open tab
about a new booking the moment it lands. `README.md` covers what it is and
what I chose not to build; this is how I got there.

## How I got here

The build settled on the domain first --- rooms and bookings, not a generic
message board --- and replaced the starter's guestbook end to end in one
sitting: schema
([`f5cfdfc`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/f5cfdfc)),
the write API
([`3624c89`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/3624c89)),
and the form/schedule/live-feed page
([`f384f22`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/f384f22)).
The starter's own contract test became this domain's:
[`f4f42e7`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/f4f42e7)
asserts persistence, the SSE broadcast, and conflict rejection against a real
running server, not mocks.

Most of the runs since have been adversarial: the form can only ever submit
values it populated itself, but the API takes any HTTP request, so each pass
asked "what could a request that isn't the form send instead" for one field
or attribute at a time --- a malformed timestamp shape
([`cd0c793`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/cd0c793)),
an unbounded pod/tutor name past the form's own `maxlength`
([`e6f1fb2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/e6f1fb2)),
and a shape-valid but calendar-invalid date the picker itself can never
produce
([`a7217d4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/a7217d4)).
Each fix came with a test that POSTs the bad value directly, proven to fail
against the un-fixed source first.

A second thread checked accessibility past what an automated axe-core sweep
can see, since axe has no rule for whether a colour is the only signal for
some state, or whether a scrollable region is keyboard-reachable at all: a
finished booking was dimmed by CSS class alone, fixed by adding a literal
"(past)" next to the end time
([`e5282e2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/e5282e2)),
and the schedule table's horizontal scroll had no `tabindex`, a dead stop for
a keyboard-only user, fixed with `role="region"` and a focusable wrapper
([`923d14c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/923d14c)).
Both are recorded in this repo's own `CLAUDE.md` as the general lesson, not
just the specific fix.

A later run drove the real end-to-end SSE path directly rather than trusting
the single-listener test: two and then three separate real browser sessions
against a local server with a throwaway database, one submitting a booking
through the actual form, the others watching `#live` update without a
reload. It confirmed the broadcast reaches every open listener correctly ---
a clean result, not a bug, but a genuine check the existing single-subscriber
vitest test doesn't cover.

A repeat a11y/keyboard/resize sweep (not the first, but the first since the
"(past)" text and the scroll region's `tabindex` had landed) found a third
gap in the same axe-invisible family: `#live`, the list the client script
prepends new bookings into, had no `aria-live` anywhere, so a screen reader
had no way to notice a new booking without already having focus inside it —
fixed by adding `aria-live="polite"`
([`ffff116`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/ffff116)).
The same run also asked whether `findConflict`'s overlap formula, correct by
construction for every containment/envelopment shape, got the one boundary
it could still get wrong — two bookings that touch but don't overlap.
Checked by hand against a local server first (no bug), then locked in as a
permanent regression test
([`fe57ec1`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/fe57ec1)).

A later run closed out the "what could a request that isn't the form send"
thread one level up, at the HTTP method rather than the field: probed `GET`
on `/api/bookings` and `POST`/`PUT`/`DELETE` on `/api/events` directly
against a local server. Both come back as Astro's own defaults — a plain 404
for a method with no exported handler, and a 403 ("Cross-site ... forbidden")
for any unsafe method whose `Origin` header doesn't match the request's own
origin, which the app's real form never has to worry about since browsers
send a matching one automatically. No fix needed, a confirmed pass — the
form's own field-level revalidation and this framework-level same-origin
check are two separate layers, and both were worth checking rather than
assuming the second was covered by the first.

A later run checked two angles the previous one had flagged as untried, both
resolving as confirmed passes rather than bugs. The app-vs-browser input-
arbitration family that found six real bugs on the crit-4/crit-5 static
prototypes turned out not to apply: the client script is ten lines with no
keydown or pointer handling to arbitrate. And whether `EventSource`'s native
reconnect after a real network blip could leave a stale listener on the
booking bus resolved by reading `astro`'s own Node adapter rather than trying
to simulate a silent network death live --- it wires stream cancellation to
the underlying response's `close` event unconditionally, which Node fires for
any connection teardown, not just the graceful and forced-kill cases already
tested live.

A later run re-read every core file fresh (`db.ts`, the two API routes,
`index.astro`) and ran a full a11y/keyboard/resize/reload/320px-reflow sweep
against the live URL, including a complete keyboard-only submission
end-to-end. Everything came back clean --- confirming, not discovering,
which was itself the signal: seven consecutive sensor families (field/HTTP
validation, SSE/deploy resilience, four axe-invisible a11y gaps, overlap
symmetry, multi-tab broadcast, redundant entry, and now a fresh full read)
had each gone dry. That's the point at which this repo's reflection got
written, rather than deferred for another pass.

A later run, after the reflection, found the one gap the "what could a
request that isn't the form send" thread hadn't asked yet: whether the
framework's own default resource limit was safe on the *actual* deployed
machine, not just in the abstract. `@astrojs/node` defaults to a 1GB request
body limit; the deployed machine has 256MB of RAM. Confirmed live against a
local production build that a single oversized field pushes RSS up several
times its own size (the raw value gets buffered, decoded, and — for a
rejected submission — echoed whole into the redirect's query string), then
bounded the limit to 64KB and added a regression test
([`9f2f010`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/9f2f010)).
Unlike the seven sensor families that had already gone dry, this was a real
fix, not a confirmed pass --- finding it took asking a new question (is the
default *safe here*, not just *reasonable in general*) rather than
re-running an existing check.

## Before you ship

`pnpm check:evidence` verifies that this comment is gone, that your citations
resolve to real commits, that a crit week's reflection entry is in
`reflections/`, and that your `CLAUDE.md` is there. It checks that your account
is traceable, not that it is good: that is the marker's call.

Images aren't checked: unlike a citation whose SHA doesn't resolve, a broken
image is visible the moment this file is rendered on GitHub.
