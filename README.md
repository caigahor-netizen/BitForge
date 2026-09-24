# BitForge

Personal engineering portfolio and knowledge base at https://caigahor.com.
Built with Astro, Markdown/MDX, and static Cloudflare Worker Assets.

## Development

Requires Node.js >=22.12.0. Install the lockfile dependencies with `npm ci`.

- `npm run dev -- --background` — start the background development server.
- `npm run astro -- dev status` — inspect server status.
- `npm run astro -- dev logs` — inspect server logs.
- `npm run astro -- dev stop` — stop the server.
- `npm run build` — generate the production site in `dist/`.

## Content and design

English routes live at `/`; Chinese routes at `/zh/`. If an article has both
language versions, keep matching IDs under `src/content/{projects,notes}` and
`src/content/zh/{projects,notes}` so the language switch links to its translation.
Chinese-only notes link back to the English notes index.

For the daily Obsidian-to-website workflow, see [Publishing notes](docs/publishing-notes.md).

Shared layout: `src/layouts/Base.astro`. Design tokens and responsive styles:
`src/styles/global.css`. Both homepages and project indexes share components.
Project illustrations are SVG concept studies, not product photographs.
Theme preference is saved locally; otherwise the OS theme is used.

Astro's content environment prebundles `picomatch` to support its CommonJS
module in the Vite 8 module runner on Windows.

## Deployment

Run the build before deployment. `wrangler.toml` defines the existing
`bitforge` Worker and publishes `dist/` as static assets. Preserve this static
configuration: an Astro Cloudflare runtime adapter is not required.
Push the verified changes to the connected repository to trigger the existing
Cloudflare build pipeline. Confirm the resulting production deployment.
