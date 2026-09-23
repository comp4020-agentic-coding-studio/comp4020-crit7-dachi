import type { APIRoute } from "astro";
import { createBooking } from "../../lib/db";
import { bus } from "../../lib/events";

// The write half of the app: a plain HTML form POSTs here, the booking is
// validated (room exists, times make sense, no clash with an existing
// booking in the same room) and either lands in SQLite and is broadcast to
// every open SSE connection, or is refused — the redirect back to "/" carries
// the reason as a query param so the page can explain it. The 303 redirect
// makes the form work with no client-side JavaScript at all: the submitting
// tab re-renders from the database; every *other* tab hears about a success
// over the stream.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const roomId = Number(form.get("roomId"));
  const pod = String(form.get("pod") ?? "").trim();
  const tutor = String(form.get("tutor") ?? "").trim();
  const startsAt = String(form.get("startsAt") ?? "").trim();
  const endsAt = String(form.get("endsAt") ?? "").trim();

  if (!roomId || !pod || !startsAt || !endsAt) {
    return redirect("/?error=missing", 303);
  }

  const result = createBooking({ roomId, pod, tutor, startsAt, endsAt });
  if (!result.ok) {
    return redirect(`/?error=${result.reason}&roomId=${roomId}`, 303);
  }

  bus.emit("booking", result.booking);
  return redirect("/", 303);
};
