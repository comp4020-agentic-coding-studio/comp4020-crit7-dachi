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

## Tests

`spec/booking.test.ts` is this project's own contract: persistence, the SSE
broadcast, and conflict rejection. Extend it when a new mechanic needs a
guarantee, rather than checking it by hand and moving on. `spec/invariants.
test.ts` and `spec/readme.test.ts` are the starter's, unchanged --- keep them
green.

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
