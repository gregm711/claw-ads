#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig, getEnabledPlatforms } from "./config.js";
import { MetaClient } from "./platforms/meta/client.js";
import { registerMetaTools } from "./platforms/meta/tools.js";

async function main() {
  const config = loadConfig();
  const enabledPlatforms = getEnabledPlatforms(config);

  if (enabledPlatforms.length === 0) {
    console.error(
      "No ad platforms configured. Set at least one access token:\n" +
        "  META_ACCESS_TOKEN - for Meta (Facebook/Instagram) ads\n"
      // Future:
      // "  GOOGLE_ADS_DEVELOPER_TOKEN - for Google Ads\n" +
      // "  TIKTOK_ACCESS_TOKEN - for TikTok Ads\n" +
      // "  X_ACCESS_TOKEN - for X (Twitter) Ads\n" +
      // "  REDDIT_ACCESS_TOKEN - for Reddit Ads\n"
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: "claw-ads",
    version: "0.1.0",
  });

  // Register platform tools based on available tokens
  if (config.meta) {
    const metaClient = new MetaClient(
      config.meta.accessToken,
      config.meta.apiVersion,
      config.meta.baseUrl
    );
    registerMetaTools(server, metaClient);
    console.error(`[claw-ads] Meta platform enabled (${config.meta.apiVersion})`);
  }

  // Future platforms:
  // if (config.google) { ... }
  // if (config.tiktok) { ... }
  // if (config.x) { ... }
  // if (config.reddit) { ... }

  // Cross-platform tools (when 2+ platforms active)
  // if (enabledPlatforms.length >= 2) {
  //   registerCrossPlatformTools(server, platforms);
  // }

  console.error(
    `[claw-ads] Server ready — ${enabledPlatforms.length} platform(s): ${enabledPlatforms.join(", ")}`
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[claw-ads] Fatal error:", err);
  process.exit(1);
});
