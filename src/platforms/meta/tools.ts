import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "./client.js";
import { success, error } from "../../utils/response.js";
import { parseMetaApiError } from "../../utils/errors.js";
import {
  ListAdAccountsSchema,
  ListCampaignsSchema,
  GetCampaignSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
  ListAdSetsSchema,
  GetAdSetSchema,
  CreateAdSetSchema,
  UpdateAdSetSchema,
  ListAdsSchema,
  CreateAdSchema,
  UpdateAdSchema,
  ListCreativesSchema,
  CreateAdCreativeSchema,
  ListAudiencesSchema,
  CreateCustomAudienceSchema,
  GetInsightsSchema,
  SearchAdLibrarySchema,
  SearchPagesSchema,
  GetPageAdsSchema,
} from "./schemas.js";

export function registerMetaTools(server: McpServer, client: MetaClient) {
  // ── Ad Accounts ─────────────────────────────────────────────────

  server.tool(
    "meta_list_ad_accounts",
    "List all Meta ad accounts accessible with your token",
    ListAdAccountsSchema,
    async () => {
      try {
        const result = await client.listAdAccounts();
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  // ── Campaigns ───────────────────────────────────────────────────

  server.tool(
    "meta_list_campaigns",
    "List campaigns in a Meta ad account",
    ListCampaignsSchema,
    async ({ account_id, limit }) => {
      try {
        const result = await client.listCampaigns(account_id, limit);
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_get_campaign",
    "Get details for a specific Meta campaign",
    GetCampaignSchema,
    async ({ campaign_id }) => {
      try {
        const result = await client.getCampaign(campaign_id);
        return success(result);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_create_campaign",
    "Create a new Meta ad campaign. Defaults to PAUSED status.",
    CreateCampaignSchema,
    async (params) => {
      try {
        const result = await client.createCampaign(params.account_id, {
          name: params.name,
          objective: params.objective,
          status: params.status,
          daily_budget: params.daily_budget,
          lifetime_budget: params.lifetime_budget,
          bid_strategy: params.bid_strategy,
          special_ad_categories: params.special_ad_categories,
        });
        return success({ id: result.id, message: "Campaign created" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_update_campaign",
    "Update an existing Meta campaign (name, status, budget, etc.)",
    UpdateCampaignSchema,
    async ({ campaign_id, ...updates }) => {
      try {
        // Filter out undefined values
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) {
          if (v !== undefined) body[k] = v;
        }
        const result = await client.updateCampaign(campaign_id, body);
        return success({ success: result.success, message: "Campaign updated" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  // ── Ad Sets ─────────────────────────────────────────────────────

  server.tool(
    "meta_list_ad_sets",
    "List ad sets in a Meta campaign or ad account",
    ListAdSetsSchema,
    async ({ parent_id, parent_type, limit }) => {
      try {
        const result = await client.listAdSets(
          parent_id,
          parent_type || "campaign",
          limit
        );
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_get_ad_set",
    "Get details for a specific Meta ad set including targeting",
    GetAdSetSchema,
    async ({ ad_set_id }) => {
      try {
        const result = await client.getAdSet(ad_set_id);
        return success(result);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_create_ad_set",
    "Create a new Meta ad set with targeting, budget, and optimization settings. Defaults to PAUSED.",
    CreateAdSetSchema,
    async (params) => {
      try {
        const result = await client.createAdSet(params.account_id, {
          name: params.name,
          campaign_id: params.campaign_id,
          billing_event: params.billing_event,
          optimization_goal: params.optimization_goal,
          daily_budget: params.daily_budget,
          lifetime_budget: params.lifetime_budget,
          bid_amount: params.bid_amount,
          bid_strategy: params.bid_strategy,
          targeting: params.targeting,
          status: params.status,
          start_time: params.start_time,
          end_time: params.end_time,
          promoted_object: params.promoted_object,
        });
        return success({ id: result.id, message: "Ad set created" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_update_ad_set",
    "Update an existing Meta ad set (targeting, budget, status, etc.)",
    UpdateAdSetSchema,
    async ({ ad_set_id, ...updates }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) {
          if (v !== undefined) body[k] = v;
        }
        const result = await client.updateAdSet(ad_set_id, body);
        return success({ success: result.success, message: "Ad set updated" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  // ── Ads ─────────────────────────────────────────────────────────

  server.tool(
    "meta_list_ads",
    "List ads in a Meta ad set or campaign",
    ListAdsSchema,
    async ({ parent_id, parent_type, limit }) => {
      try {
        const result = await client.listAds(
          parent_id,
          parent_type || "adset",
          limit
        );
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_create_ad",
    "Create a new Meta ad linking an ad set to a creative. Defaults to PAUSED.",
    CreateAdSchema,
    async (params) => {
      try {
        const result = await client.createAd(params.account_id, {
          name: params.name,
          adset_id: params.adset_id,
          creative: { creative_id: params.creative_id },
          status: params.status,
        });
        return success({ id: result.id, message: "Ad created" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_update_ad",
    "Update an existing Meta ad (status, creative, name)",
    UpdateAdSchema,
    async ({ ad_id, creative_id, ...updates }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) {
          if (v !== undefined) body[k] = v;
        }
        if (creative_id) body.creative = { creative_id };
        const result = await client.updateAd(ad_id, body);
        return success({ success: result.success, message: "Ad updated" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  // ── Creatives ───────────────────────────────────────────────────

  server.tool(
    "meta_list_creatives",
    "List ad creatives in a Meta ad account",
    ListCreativesSchema,
    async ({ account_id, limit }) => {
      try {
        const result = await client.listCreatives(account_id, limit);
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_create_ad_creative",
    "Create a new Meta ad creative with image/video and copy",
    CreateAdCreativeSchema,
    async (params) => {
      try {
        const result = await client.createAdCreative(params.account_id, {
          name: params.name,
          object_story_spec: params.object_story_spec,
        });
        return success({ id: result.id, message: "Creative created" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  // ── Audiences ───────────────────────────────────────────────────

  server.tool(
    "meta_list_audiences",
    "List custom and lookalike audiences in a Meta ad account",
    ListAudiencesSchema,
    async ({ account_id, limit }) => {
      try {
        const result = await client.listAudiences(account_id, limit);
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_create_custom_audience",
    "Create a custom or lookalike audience in Meta",
    CreateCustomAudienceSchema,
    async (params) => {
      try {
        const result = await client.createCustomAudience(params.account_id, {
          name: params.name,
          description: params.description,
          subtype: params.subtype,
          customer_file_source: params.customer_file_source,
          rule: params.rule,
          lookalike_spec: params.lookalike_spec,
        });
        return success({ id: result.id, message: "Audience created" });
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  // ── Insights ────────────────────────────────────────────────────

  server.tool(
    "meta_get_insights",
    "Get performance metrics (impressions, clicks, spend, CPC, CTR, etc.) for a Meta campaign, ad set, ad, or account",
    GetInsightsSchema,
    async (params) => {
      try {
        const insightParams: {
          date_preset?: string;
          time_range?: { since: string; until: string };
          breakdowns?: string;
          level?: string;
          fields?: string;
        } = {};

        if (params.time_range_since && params.time_range_until) {
          insightParams.time_range = {
            since: params.time_range_since,
            until: params.time_range_until,
          };
        } else if (params.date_preset) {
          insightParams.date_preset = params.date_preset;
        }

        if (params.breakdowns) insightParams.breakdowns = params.breakdowns;
        if (params.level) insightParams.level = params.level;
        if (params.fields) insightParams.fields = params.fields;

        const result = await client.getInsights(
          params.object_id,
          insightParams
        );
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  // ── Ad Library (Competitor Research) ────────────────────────────

  server.tool(
    "meta_search_ad_library",
    "Search the Meta Ad Library for competitor ads by keyword, country, or page. Great for competitive research.",
    SearchAdLibrarySchema,
    async (params) => {
      try {
        const result = await client.searchAdLibrary({
          search_terms: params.search_terms,
          search_page_ids: params.search_page_ids,
          ad_reached_countries: params.ad_reached_countries,
          ad_active_status: params.ad_active_status,
          media_type: params.media_type,
          limit: params.limit,
        });
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_search_pages",
    "Search for Facebook Pages by brand/company name. Use this to find page IDs for ad library lookups.",
    SearchPagesSchema,
    async ({ query, limit }) => {
      try {
        const result = await client.searchPages(query, limit);
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );

  server.tool(
    "meta_get_page_ads",
    "Get all active ads for a specific Facebook Page. Use meta_search_pages first to find the page ID.",
    GetPageAdsSchema,
    async ({ page_id, countries, limit }) => {
      try {
        const result = await client.getPageAds(page_id, countries, limit);
        return success(result.data);
      } catch (err) {
        return error(parseMetaApiError(err));
      }
    }
  );
}
