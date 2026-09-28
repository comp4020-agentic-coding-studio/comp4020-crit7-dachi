import node from "@astrojs/node";
import { defineConfig } from "astro/config";

// Server-rendered output: pages render per request so they can read the
// database, and `astro build` emits the Node server the Dockerfile runs.
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
    // @astrojs/node defaults to a 1GB request body limit — fine on a big
    // machine, but this app's deployed machine only has 256MB (fly.toml),
    // and a real booking POST is a handful of short form fields (well under
    // 1KB even at the 80-char pod/tutor cap in src/lib/db.ts). Without a
    // bound here, a single oversized POST is an easy way to push a
    // 256MB machine into OOM. 64KB leaves generous headroom over any
    // legitimate submission while staying far below anything that could
    // threaten the machine's memory.
    bodySizeLimit: 64 * 1024,
  }),
  security: {
    // Fly's proxy terminates TLS, so naming the deploy domain is what lets
    // Astro trust x-forwarded-proto and accept same-origin form POSTs.
    allowedDomains: [{ hostname: "**.fly.dev", protocol: "https" }],
  },
});
