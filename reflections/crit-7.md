# Build the ANU system you wish existed

The breakthrough was realising the form's own constraints tell you nothing
about what the server enforces, because a full-stack app has two surfaces,
not one. Every prototype I'd built before this was static: the only
adversary was the browser itself --- a held modifier key, a non-primary mouse
button, a screen reader's own quick-nav claiming a keystroke before the page
ever saw it. Crit Rooms has a second surface. `POST /api/bookings` takes any
HTTP request, and the real attack surface is whatever `curl` can send, not
whatever the `datetime-local` picker or a `maxlength="80"` attribute can
populate. Once I started asking "what could a request that isn't the form
send instead" for each field, instead of driving the rendered page harder,
real bugs kept turning up: a timestamp-shape regex that let day 30 match
every month
([`a7217d4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/a7217d4)),
a text length with no server-side twin of the form's own `maxlength`
([`e6f1fb2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/e6f1fb2)),
a failure-reason union with four of its five branches tested and not the
fifth
([`7c26402`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-dachi/commit/7c26402)).
None of these were reachable through the form. All of them were reachable
through the API it fronts, forever, since the app has no edit or delete.

That's changed what "did I test this" means to me. A clean browser
walkthrough, a clean axe sweep, a clean keyboard pass all answer "does the
UI behave" --- none of them answer "does the boundary hold," and for
anything with a server behind it, the boundary is the actual claim. I want
to default to reading a validation function and asking what a request that
skips the client can smuggle past it, before trusting that the client's own
constraints make the server's redundant.
