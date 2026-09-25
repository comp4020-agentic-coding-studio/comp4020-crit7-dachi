# Your harness

This file is yours, and it arrives empty on purpose. The rules you hold the
agent to are part of what gets marked, so they should be rules you decided on.

Nothing about the starter is recorded here. What the repo ships is explained
where it lives --- `fly.toml`, the `Dockerfile`, the CI workflow and
`spec/README.md` each say what they fix --- and the
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec. Read them before you plan or build;
what the agent needs to carry from any of it is your call.

## Scope

This models one slice of ANU crit-room booking, not a full room-booking
system: no accounts, no editing or cancelling a booking, no recurring
bookings, a fixed seeded room list. `README.md`'s "what I chose not to build"
is the reasoning; don't widen any of it without deciding to on purpose.

## Data

- Every timestamp in `bookings` is a bare `YYYY-MM-DDTHH:mm` string with no
  timezone, assumed to be Australia/Canberra local (every room is on this one
  campus). Don't convert this to UTC or attach an offset --- `nowLocal()` and
  the overlap check in `src/lib/db.ts` both depend on plain lexicographic
  string comparison, which only stays correct if every timestamp is in the
  same, timezone-less shape.
- `createBooking` revalidates the room id and time range server-side even
  though the form only ever submits values it populated itself --- keep it
  that way; never trust a client-submitted booking without rechecking it.
- That revalidation is one layer; Astro's own same-origin check is another,
  underneath it. `POST /api/bookings` (and any other unsafe method) 403s with
  "Cross-site ... forbidden" unless the request's `Origin` header matches its
  own origin --- checked directly with `curl` against a local server, both
  with a forged `Origin` and with none at all. `spec/booking.test.ts`'s `post`
  helper sets a matching `Origin` header for exactly this reason (real browser
  form submissions carry one automatically; a bare `fetch`/`curl` doesn't).
  `GET /api/bookings` and `POST`/`PUT`/`DELETE` on `/api/events` all 404,
  Astro's default for a method with no exported handler. Neither needed a
  fix --- confirmed clean, not assumed, since the field-level revalidation
  above doesn't by itself say anything about the method/origin boundary.

## Tests

`spec/booking.test.ts` is this project's own contract: persistence, the SSE
broadcast, and conflict rejection. Extend it when a new mechanic needs a
guarantee, rather than checking it by hand and moving on. `spec/invariants.
test.ts` and `spec/readme.test.ts` are the starter's, unchanged --- keep them
green.

`findConflict`'s overlap query (`existing.start < new.end && existing.end >
new.start`) is a single symmetric formula, so it's correct for containment,
envelopment, and exact-match overlap in every direction by construction --- no
need to test each shape separately. The one genuine edge it could still get
wrong is the half-open boundary itself: a booking that starts exactly when
another ends in the same room shouldn't conflict, and nothing in this file
asserted that until now. Checked by hand first (direct `curl` POSTs against a
local server: touching-before, touching-after, and a 1-minute genuine overlap
all resolved correctly), then locked in as a permanent regression test rather
than left as a one-off check, since an off-by-one on `</<=` or `>/>=` here is
exactly the kind of change a future edit could make silently.

The SSE test only ever has one subscriber. It proves `bus.emit` reaches *a*
listener, not that the real app broadcasts to every open tab at once. Checked
this directly instead of trusting the single-subscriber test to stand in for
it: a local server against a throwaway database, three separate real
`agent-browser` sessions, one submitting through the actual form while the
other two watched `#live` --- both received the booking, confirming
`EventEmitter`'s fan-out (`src/lib/events.ts`) really does reach every open
connection, not just the first. A clean result, not a bug; worth re-running
if the broadcast path is ever touched, since nothing in `spec/` would catch a
regression that only breaks the second listener.

## Accessibility

`spec/invariants.test.ts`'s axe pass runs in jsdom, and even a real-browser
`agent-browser a11y` sweep only catches automatable rules. Neither can flag
"use of color" (WCAG 1.4.1) --- axe has no rule for it, since judging whether
a colour is the *only* signal for some state needs reading the markup, not
just measuring it. The schedule table's `tr.past` class was exactly that gap:
a finished booking was dimmed by colour alone, with nothing else in the row
saying so. Fixed by appending literal " (past)" text next to the end time
(`src/pages/index.astro`) --- when a class name encodes state that isn't
already implied by other visible text, check whether removing the CSS rule
would leave a sighted user with no way to tell, before trusting a clean axe
result to mean the row is fine.

A second axe-invisible gap, same shape (a real WCAG failure with no rule
that catches it): `.table-scroll`'s `overflow-x: auto` on the schedule table
had no `tabindex`, so once the table is wider than the viewport (any real
phone width, once a room name is long enough) there was no way for a
keyboard-only user to even reach the scrollable region, let alone scroll
it --- the table itself has no focusable cells, so it was a dead stop
between the submit button and the page bottom. Confirmed live: a real
`Tab` walkthrough at 390px skipped straight past it, and `scrollWidth >
clientWidth` was true the whole time. Fixed with `tabindex="0" role="region"
aria-label="Schedule"` on the wrapping div, re-confirmed a real `Tab` reaches
it and `ArrowRight` then moves `scrollLeft`. General lesson for any
`overflow: auto` wrapper around non-interactive content (a table, a wide
diagram): check whether the wrapper itself is keyboard-focusable, not just
whether axe is clean --- axe has no rule for "can a keyboard reach this
scroll container" either.

A third axe-invisible gap, in the same family but a different WCAG success
criterion: `#live`, the `<ul>` the client script prepends new bookings into
from the SSE stream, had no `aria-live` attribute anywhere --- a screen
reader gets no indication a new booking appeared unless it happens to have
focus inside that list at the exact moment. This is WCAG 4.1.3 (status
messages): content that updates to convey information, without a context
change or moved focus, has to be a live region. A fresh `agent-browser a11y`
sweep against the deployed app came back 0 violations/0 incomplete both
before and after adding `aria-live="polite"` --- axe checks *how* an existing
`aria-live` region is used, not whether a dynamically-updated region has one
at all. Fixed in `src/pages/index.astro`; confirmed the attribute survives
the build and that new `<li>`s still land inside it correctly. General
lesson: any element a client script mutates outside of a page navigation
(prepending, appending, replacing text) is a candidate for this exact gap ---
check it has an `aria-live` (or `role="status"`/`role="alert"`) before
trusting a clean a11y sweep, the same way the `tr.past` and `.table-scroll`
entries above already teach for colour-only state and keyboard reachability.
