# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run build          # Compile TypeScript → build/
npm run dev            # Watch mode (tsc --watch)
npm start              # Run the MCP server (requires META_ACCESS_TOKEN)
```

Smoke test the server locally:
```bash
META_ACCESS_TOKEN=test node build/index.js <<< '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

No test framework is configured yet. No linter is configured yet.

## Architecture

This is an MCP (Model Context Protocol) server that provides tools for managing ads across platforms. It uses `@modelcontextprotocol/sdk` with stdio transport.

### Platform auto-registration

`src/index.ts` reads environment variables via `src/config.ts` and only registers tools for platforms whose tokens are present. Currently only Meta is implemented. Future platforms (Google, TikTok, X, Reddit) follow the same pattern.

### Adding a new platform

Each platform lives in `src/platforms/{name}/` with three files:
- **`client.ts`** — API client class that implements `PlatformMetricsProvider` (from `src/platforms/types.ts`) for cross-platform rollups. Contains all HTTP calls to the platform's API.
- **`schemas.ts`** — Zod schema objects exported as plain `{ field: z.type() }` records (not `z.object()`). These are passed directly to `server.tool()` which wraps them.
- **`tools.ts`** — Exports a `register{Platform}Tools(server, client)` function that calls `server.tool()` for each tool. Uses `success()` / `error()` helpers from `src/utils/response.ts`.

Then add a config block in `src/config.ts` and a registration block in `src/index.ts`.

### Conventions

- Tool names are prefixed by platform: `meta_*`, `google_*`, `tiktok_*`, `xplat_*`
- All write operations (create/update) default to `PAUSED` status
- Tool handlers follow try/catch with `parseMetaApiError()` (or platform equivalent) for user-friendly error messages
- The Meta client uses Node's built-in `fetch` — no axios or other HTTP library
- All imports use `.js` extensions (required by Node16 module resolution)
- Budgets are in cents (e.g. 5000 = $50.00) matching Meta API conventions
