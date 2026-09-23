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
