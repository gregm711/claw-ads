# claw-ads

MCP server for managing and analyzing ads across major ad platforms. One token, one server, full read/write control over your ad campaigns — plus built-in competitor research.

Currently supports **Meta (Facebook/Instagram)**. Google Ads, TikTok, X, and Reddit are on the roadmap.

## Setup

### Install

```bash
git clone https://github.com/gregm711/claw-ads.git
cd claw-ads
npm install
npm run build
```

### Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "claw-ads": {
      "command": "node",
      "args": ["/path/to/claw-ads/build/index.js"],
      "env": {
        "META_ACCESS_TOKEN": "your_meta_access_token"
      }
    }
  }
}
```

### Get a Meta Access Token

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create an app or use an existing one
3. In the [Graph API Explorer](https://developers.facebook.com/tools/explorer/), generate a token with these permissions:
   - `ads_management` — create and manage campaigns
   - `ads_read` — read campaign data and insights
   - `pages_read_engagement` — search pages for competitor research
4. For production use, exchange for a long-lived token (60 days) or create a System User token (non-expiring)

### Optional Environment Variables

| Variable | Default | Description |
|---|---|---|
| `META_API_VERSION` | `v23.0` | Meta Graph API version |
| `META_BASE_URL` | `https://graph.facebook.com` | API base URL |

## Tools

### Campaign Management

| Tool | Description |
|---|---|
| `meta_list_ad_accounts` | List all accessible ad accounts |
| `meta_list_campaigns` | List campaigns in an account |
| `meta_get_campaign` | Get campaign details |
| `meta_create_campaign` | Create a campaign (defaults to PAUSED) |
| `meta_update_campaign` | Update campaign name, status, budget |
| `meta_list_ad_sets` | List ad sets in a campaign or account |
| `meta_get_ad_set` | Get ad set details including targeting |
| `meta_create_ad_set` | Create ad set with targeting and budget |
| `meta_update_ad_set` | Update ad set targeting, budget, status |
| `meta_list_ads` | List ads in an ad set or campaign |
| `meta_create_ad` | Create ad linking ad set to creative |
| `meta_update_ad` | Update ad status, creative, name |
| `meta_list_creatives` | List ad creatives in an account |
| `meta_create_ad_creative` | Create image or video ad creative |

### Audiences

| Tool | Description |
|---|---|
| `meta_list_audiences` | List custom and lookalike audiences |
| `meta_create_custom_audience` | Create custom, website, or lookalike audience |

### Analytics

| Tool | Description |
|---|---|
| `meta_get_insights` | Get performance metrics (impressions, clicks, spend, CPC, CTR, etc.) with date ranges and breakdowns |

### Competitor Research

| Tool | Description |
|---|---|
| `meta_search_ad_library` | Search public Ad Library by keyword, country, or page |
| `meta_search_pages` | Find a brand's Facebook Page ID |
| `meta_get_page_ads` | Get all active ads for a specific page |

## Example Usage

**Check campaign performance:**
> "Show me the last 30 days of performance for all my campaigns"

**Create a campaign:**
> "Create a new traffic campaign called 'Spring Sale' with a $50/day budget"

**Competitor research:**
> "Find Nike's Facebook page and show me all their active US ads"

**Analyze and optimize:**
> "Compare CTR across my ad sets and pause anything below 1%"

## Architecture

```
src/
├── index.ts                    # Server entry point
├── config.ts                   # Platform auto-detection
├── platforms/
│   ├── types.ts                # Cross-platform metrics interface
│   └── meta/
│       ├── client.ts           # Meta Graph API client
│       ├── schemas.ts          # Zod input validation
│       └── tools.ts            # Tool registrations
└── utils/
    ├── response.ts             # Response formatting
    └── errors.ts               # Error handling
```

Platforms auto-register based on which tokens are present. Only Meta tools load if only `META_ACCESS_TOKEN` is set. Future platforms (Google, TikTok, X, Reddit) follow the same `platforms/{name}/` pattern.

All write operations default to `PAUSED` status so nothing goes live accidentally.

## License

MIT
