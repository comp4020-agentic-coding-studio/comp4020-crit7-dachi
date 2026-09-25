import { describe, expect, inject, it } from "vitest";

// This week's own contract: a booking survives a reload, a new one reaches
// other tabs over the SSE stream (the same two platform claims the starter's
// retired guestbook.test.ts made, now against the real domain), and — the
// actual point of this app over a shared spreadsheet — a second booking that
// overlaps an existing one in the same room is refused, not silently
// accepted. The seeded room ids (1-4, see src/lib/db.ts) are stable on a
// fresh throwaway database, so each test below picks a distinct room and time
// window to stay independent of the others.
const baseUrl = inject("baseUrl");

// Astro checks form POSTs carry a same-origin Origin header (CSRF
// protection); browsers send it automatically, a bare fetch doesn't.
const post = (path: string, body: URLSearchParams) =>
  fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { origin: baseUrl },
    body,
    redirect: "manual",
  });

const booking = (overrides: Record<string, string>) =>
  new URLSearchParams({
    roomId: "1",
    tutor: "Test Tutor",
    startsAt: "2031-01-01T10:00",
    endsAt: "2031-01-01T11:00",
    ...overrides,
  });

describe("bookings", () => {
  it("accepts a booking and redirects back to the page", async () => {
    const res = await post(
      "/api/bookings",
      booking({
        pod: `probe ${process.hrtime.bigint()}`,
        roomId: "1",
        startsAt: "2031-02-01T09:00",
        endsAt: "2031-02-01T10:00",
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/");
  });

  it("persists the booking: a fresh page load includes it", async () => {
    const pod = `persisted ${process.hrtime.bigint()}`;
    await post(
      "/api/bookings",
      booking({ pod, roomId: "1", startsAt: "2031-02-02T09:00", endsAt: "2031-02-02T10:00" }),
    );
    const res = await fetch(baseUrl);
    expect(await res.text()).toContain(pod);
  });

  it("broadcasts a new booking over the SSE stream", async () => {
    const pod = `live ${process.hrtime.bigint()}`;

    // subscribe first, then post, then read until the event arrives
    const stream = await fetch(new URL("/api/events", baseUrl));
    expect(stream.headers.get("content-type")).toContain("text/event-stream");
    const reader = stream.body?.getReader();
    if (!reader) throw new Error("no response body");

    await post(
      "/api/bookings",
      booking({ pod, roomId: "2", startsAt: "2031-02-03T09:00", endsAt: "2031-02-03T10:00" }),
    );

    const decoder = new TextDecoder();
    let received = "";
    while (!received.includes(pod)) {
      const { value, done } = await reader.read();
      if (done) throw new Error("stream ended before the event arrived");
      received += decoder.decode(value, { stream: true });
    }
    await reader.cancel();
    expect(received).toContain("data: ");
    expect(received).toContain(pod);
  }, 10_000);

  it("refuses a booking that overlaps an existing one in the same room", async () => {
    const first = `first ${process.hrtime.bigint()}`;
    const second = `second ${process.hrtime.bigint()}`;

    const firstRes = await post(
      "/api/bookings",
      booking({ pod: first, roomId: "3", startsAt: "2031-03-01T10:00", endsAt: "2031-03-01T11:00" }),
    );
    expect(firstRes.status).toBe(303);

    // starts before the first ends, ends after it starts: a genuine overlap
    const secondRes = await post(
      "/api/bookings",
      booking({ pod: second, roomId: "3", startsAt: "2031-03-01T10:30", endsAt: "2031-03-01T11:30" }),
    );
    expect(secondRes.status).toBe(303);
    expect(secondRes.headers.get("location")).toBe("/?error=conflict&roomId=3");

    const body = await (await fetch(baseUrl)).text();
    expect(body).toContain(first);
    expect(body).not.toContain(second);
  });

  it("allows a booking that starts exactly when another ends in the same room", async () => {
    // findConflict's windows are half-open ([start, end)) on purpose — a
    // 9-10am booking and a 10-11am booking in the same room don't overlap.
    // The comparison is `existing.start < new.end && existing.end > new.start`;
    // an off-by-one here (<=/>= instead of </>) would make legitimate
    // back-to-back bookings collide, and nothing else in this file exercises
    // the boundary.
    const first = `touch-first ${process.hrtime.bigint()}`;
    const second = `touch-second ${process.hrtime.bigint()}`;

    const firstRes = await post(
      "/api/bookings",
      booking({ pod: first, roomId: "4", startsAt: "2031-05-01T09:00", endsAt: "2031-05-01T10:00" }),
    );
    expect(firstRes.status).toBe(303);
    expect(firstRes.headers.get("location")).toBe("/");

    const secondRes = await post(
      "/api/bookings",
      booking({ pod: second, roomId: "4", startsAt: "2031-05-01T10:00", endsAt: "2031-05-01T11:00" }),
    );
    expect(secondRes.status).toBe(303);
    expect(secondRes.headers.get("location")).toBe("/");

    const body = await (await fetch(baseUrl)).text();
    expect(body).toContain(first);
    expect(body).toContain(second);
  });

  it("rejects a booking whose timestamps aren't in the datetime-local shape", async () => {
    // The form can only ever produce this shape, but the API route takes any
    // HTTP request — a client that isn't the form (or a broken one) could
    // send anything, and the ordering/overlap checks trust the shape without
    // this guard (see the TIME_SHAPE comment in src/lib/db.ts).
    const pod = `malformed ${process.hrtime.bigint()}`;
    const res = await post(
      "/api/bookings",
      booking({ pod, roomId: "4", startsAt: "banana", endsAt: "zebra" }),
    );
    expect(res.headers.get("location")).toBe("/?error=bad-format&roomId=4");

    const body = await (await fetch(baseUrl)).text();
    expect(body).not.toContain(pod);
  });

  it("rejects a booking whose pod name is longer than the form allows", async () => {
    // The form's `maxlength="80"` on `pod`/`tutor` is a browser-side
    // courtesy — a client that isn't the form could send anything, and
    // with no edit or delete an oversized name would sit there forever.
    const pod = "x".repeat(81);
    const res = await post("/api/bookings", booking({ pod, roomId: "4" }));
    expect(res.headers.get("location")).toBe("/?error=too-long&roomId=4");

    const body = await (await fetch(baseUrl)).text();
    expect(body).not.toContain(pod);
  });

  it("rejects a booking on a calendar date that doesn't exist", async () => {
    // TIME_SHAPE only checks digit shape, not that the day fits the month —
    // "day 30" matches the pattern for every month, but February never has
    // one. The datetime-local picker itself can't produce this value, but a
    // client that isn't the form can.
    const pod = `no-such-day ${process.hrtime.bigint()}`;
    const res = await post(
      "/api/bookings",
      booking({ pod, roomId: "4", startsAt: "2031-02-30T09:00", endsAt: "2031-02-30T10:00" }),
    );
    expect(res.headers.get("location")).toBe("/?error=bad-format&roomId=4");

    const body = await (await fetch(baseUrl)).text();
    expect(body).not.toContain(pod);
  });

  it("rejects a booking for a room that doesn't exist", async () => {
    const pod = `no-such-room ${process.hrtime.bigint()}`;
    const res = await post(
      "/api/bookings",
      booking({ pod, roomId: "999", startsAt: "2031-06-01T09:00", endsAt: "2031-06-01T10:00" }),
    );
    expect(res.headers.get("location")).toBe("/?error=unknown-room&roomId=999");

    const body = await (await fetch(baseUrl)).text();
    expect(body).not.toContain(pod);
  });

  it("rejects a booking that ends before it starts", async () => {
    const pod = `backwards ${process.hrtime.bigint()}`;
    const res = await post(
      "/api/bookings",
      booking({ pod, roomId: "4", startsAt: "2031-04-01T11:00", endsAt: "2031-04-01T10:00" }),
    );
    expect(res.headers.get("location")).toBe("/?error=bad-range&roomId=4");

    const body = await (await fetch(baseUrl)).text();
    expect(body).not.toContain(pod);
  });
});
