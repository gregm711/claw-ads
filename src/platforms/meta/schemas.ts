import { z } from "zod";

// ── Account ─────────────────────────────────────────────────────────

export const ListAdAccountsSchema = {};

// ── Campaigns ───────────────────────────────────────────────────────

export const ListCampaignsSchema = {
  account_id: z
    .string()
    .describe("Ad account ID (e.g. act_123456789)"),
  limit: z
    .number()
    .optional()
    .describe("Max campaigns to return (default 25)"),
};

export const GetCampaignSchema = {
  campaign_id: z.string().describe("Campaign ID"),
};

export const CreateCampaignSchema = {
  account_id: z
    .string()
    .describe("Ad account ID (e.g. act_123456789)"),
  name: z.string().describe("Campaign name"),
  objective: z
    .enum([
      "OUTCOME_AWARENESS",
      "OUTCOME_ENGAGEMENT",
      "OUTCOME_LEADS",
      "OUTCOME_SALES",
      "OUTCOME_TRAFFIC",
      "OUTCOME_APP_PROMOTION",
    ])
    .describe("Campaign objective"),
  status: z
    .enum(["ACTIVE", "PAUSED"])
    .optional()
    .describe("Initial status (default PAUSED)"),
  daily_budget: z
    .number()
    .optional()
    .describe("Daily budget in cents (e.g. 5000 = $50.00)"),
  lifetime_budget: z
    .number()
    .optional()
    .describe("Lifetime budget in cents"),
  bid_strategy: z
    .enum([
      "LOWEST_COST_WITHOUT_CAP",
      "LOWEST_COST_WITH_BID_CAP",
      "COST_CAP",
      "LOWEST_COST_WITH_MIN_ROAS",
    ])
    .optional()
    .describe("Bid strategy"),
  special_ad_categories: z
    .array(
      z.enum([
        "NONE",
        "EMPLOYMENT",
        "HOUSING",
        "CREDIT",
        "ISSUES_ELECTIONS_POLITICS",
      ])
    )
    .optional()
    .describe("Special ad categories (required by Meta policy)"),
};

export const UpdateCampaignSchema = {
  campaign_id: z.string().describe("Campaign ID to update"),
  name: z.string().optional().describe("New campaign name"),
  status: z
    .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
    .optional()
    .describe("New status"),
  daily_budget: z.number().optional().describe("New daily budget in cents"),
  lifetime_budget: z
    .number()
    .optional()
    .describe("New lifetime budget in cents"),
  bid_strategy: z.string().optional().describe("New bid strategy"),
};

// ── Ad Sets ─────────────────────────────────────────────────────────

export const ListAdSetsSchema = {
  parent_id: z
    .string()
    .describe("Campaign ID or Ad Account ID to list ad sets from"),
  parent_type: z
    .enum(["campaign", "account"])
    .optional()
    .describe("Whether parent_id is a campaign or account (default campaign)"),
  limit: z.number().optional().describe("Max results (default 25)"),
};

export const GetAdSetSchema = {
  ad_set_id: z.string().describe("Ad Set ID"),
};

export const CreateAdSetSchema = {
  account_id: z
    .string()
    .describe("Ad account ID (e.g. act_123456789)"),
  name: z.string().describe("Ad set name"),
  campaign_id: z.string().describe("Parent campaign ID"),
  billing_event: z
    .enum(["IMPRESSIONS", "LINK_CLICKS", "POST_ENGAGEMENT", "THRUPLAY"])
    .describe("When you get charged"),
  optimization_goal: z
    .enum([
      "REACH",
      "IMPRESSIONS",
      "LINK_CLICKS",
      "LANDING_PAGE_VIEWS",
      "OFFSITE_CONVERSIONS",
      "LEAD_GENERATION",
      "APP_INSTALLS",
      "VALUE",
      "THRUPLAY",
      "POST_ENGAGEMENT",
    ])
    .describe("What to optimize for"),
  daily_budget: z
    .number()
    .optional()
    .describe("Daily budget in cents (required if campaign has no budget)"),
  lifetime_budget: z.number().optional().describe("Lifetime budget in cents"),
  bid_amount: z.number().optional().describe("Bid cap in cents"),
  bid_strategy: z.string().optional().describe("Bid strategy"),
  targeting: z
    .object({
      geo_locations: z
        .object({
          countries: z.array(z.string()).optional(),
          cities: z.array(z.object({ key: z.string() })).optional(),
          regions: z.array(z.object({ key: z.string() })).optional(),
        })
        .optional(),
      age_min: z.number().optional(),
      age_max: z.number().optional(),
      genders: z.array(z.number()).optional(),
      interests: z
        .array(z.object({ id: z.string(), name: z.string().optional() }))
        .optional(),
      custom_audiences: z
        .array(z.object({ id: z.string() }))
        .optional(),
      excluded_custom_audiences: z
        .array(z.object({ id: z.string() }))
        .optional(),
      publisher_platforms: z
        .array(z.enum(["facebook", "instagram", "audience_network", "messenger"]))
        .optional(),
    })
    .passthrough()
    .describe("Targeting spec"),
  status: z.enum(["ACTIVE", "PAUSED"]).optional().describe("Initial status"),
  start_time: z.string().optional().describe("Start time (ISO 8601)"),
  end_time: z.string().optional().describe("End time (ISO 8601)"),
  promoted_object: z
    .record(z.unknown())
    .optional()
    .describe("Promoted object (e.g. { pixel_id: '...', custom_event_type: 'PURCHASE' })"),
};

export const UpdateAdSetSchema = {
  ad_set_id: z.string().describe("Ad Set ID to update"),
  name: z.string().optional().describe("New name"),
  status: z
    .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
    .optional()
    .describe("New status"),
  daily_budget: z.number().optional().describe("New daily budget in cents"),
  lifetime_budget: z.number().optional().describe("New lifetime budget"),
  bid_amount: z.number().optional().describe("New bid cap"),
  targeting: z.record(z.unknown()).optional().describe("New targeting spec"),
  end_time: z.string().optional().describe("New end time"),
};

// ── Ads ─────────────────────────────────────────────────────────────

export const ListAdsSchema = {
  parent_id: z
    .string()
    .describe("Ad Set ID or Campaign ID to list ads from"),
  parent_type: z
    .enum(["adset", "campaign"])
    .optional()
    .describe("Whether parent_id is an adset or campaign (default adset)"),
  limit: z.number().optional().describe("Max results (default 25)"),
};

export const CreateAdSchema = {
  account_id: z
    .string()
    .describe("Ad account ID (e.g. act_123456789)"),
  name: z.string().describe("Ad name"),
  adset_id: z.string().describe("Ad set to place this ad in"),
  creative_id: z.string().describe("Creative ID to use"),
  status: z
    .enum(["ACTIVE", "PAUSED"])
    .optional()
    .describe("Initial status (default PAUSED)"),
};

export const UpdateAdSchema = {
  ad_id: z.string().describe("Ad ID to update"),
  name: z.string().optional().describe("New name"),
  status: z
    .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
    .optional()
    .describe("New status"),
  creative_id: z.string().optional().describe("New creative ID"),
};

// ── Creatives ───────────────────────────────────────────────────────

export const ListCreativesSchema = {
  account_id: z
    .string()
    .describe("Ad account ID"),
  limit: z.number().optional().describe("Max results (default 25)"),
};

export const CreateAdCreativeSchema = {
  account_id: z
    .string()
    .describe("Ad account ID"),
  name: z.string().describe("Creative name"),
  object_story_spec: z
    .object({
      page_id: z.string().describe("Facebook Page ID to post from"),
      link_data: z
        .object({
          link: z.string().describe("Destination URL"),
          message: z.string().optional().describe("Post text"),
          name: z.string().optional().describe("Link headline"),
          description: z.string().optional().describe("Link description"),
          image_hash: z.string().optional().describe("Uploaded image hash"),
          call_to_action: z
            .object({
              type: z.string().describe("CTA type (e.g. LEARN_MORE, SHOP_NOW)"),
              value: z.record(z.unknown()).optional(),
            })
            .optional(),
        })
        .optional(),
      video_data: z
        .object({
          video_id: z.string().describe("Uploaded video ID"),
          message: z.string().optional(),
          title: z.string().optional(),
          image_hash: z.string().optional().describe("Thumbnail image hash"),
          call_to_action: z
            .object({
              type: z.string(),
              value: z.record(z.unknown()).optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .passthrough()
    .describe("Creative spec — use link_data for image/link ads, video_data for video ads"),
};

// ── Audiences ───────────────────────────────────────────────────────

export const ListAudiencesSchema = {
  account_id: z
    .string()
    .describe("Ad account ID"),
  limit: z.number().optional().describe("Max results (default 25)"),
};

export const CreateCustomAudienceSchema = {
  account_id: z
    .string()
    .describe("Ad account ID"),
  name: z.string().describe("Audience name"),
  description: z.string().optional().describe("Audience description"),
  subtype: z
    .enum(["CUSTOM", "WEBSITE", "APP", "OFFLINE", "LOOKALIKE", "ENGAGEMENT"])
    .describe("Audience subtype"),
  rule: z
    .record(z.unknown())
    .optional()
    .describe("Rule-based audience definition (for WEBSITE/APP subtypes)"),
  lookalike_spec: z
    .record(z.unknown())
    .optional()
    .describe("Lookalike spec (for LOOKALIKE subtype)"),
  customer_file_source: z
    .enum([
      "USER_PROVIDED_ONLY",
      "PARTNER_PROVIDED_ONLY",
      "BOTH_USER_AND_PARTNER_PROVIDED",
    ])
    .optional()
    .describe("Data source for CUSTOM subtype"),
};

// ── Insights ────────────────────────────────────────────────────────

export const GetInsightsSchema = {
  object_id: z
    .string()
    .describe("ID of campaign, ad set, ad, or ad account to get insights for"),
  date_preset: z
    .enum([
      "today",
      "yesterday",
      "this_month",
      "last_month",
      "last_3d",
      "last_7d",
      "last_14d",
      "last_28d",
      "last_30d",
      "last_90d",
    ])
    .optional()
    .describe("Date preset (default last_30d). Ignored if time_range is set."),
  time_range_since: z
    .string()
    .optional()
    .describe("Start date (YYYY-MM-DD). Use with time_range_until."),
  time_range_until: z
    .string()
    .optional()
    .describe("End date (YYYY-MM-DD). Use with time_range_since."),
  breakdowns: z
    .enum([
      "age",
      "gender",
      "country",
      "region",
      "dma",
      "publisher_platform",
      "platform_position",
      "device_platform",
    ])
    .optional()
    .describe("Break results down by dimension"),
  level: z
    .enum(["account", "campaign", "adset", "ad"])
    .optional()
    .describe("Aggregation level"),
  fields: z
    .string()
    .optional()
    .describe("Comma-separated fields to return (advanced)"),
};

// ── Ad Library (Competitor Research) ────────────────────────────────

export const SearchAdLibrarySchema = {
  search_terms: z
    .string()
    .optional()
    .describe("Keywords to search for in ad content"),
  search_page_ids: z
    .array(z.string())
    .optional()
    .describe("Specific Facebook Page IDs to search"),
  ad_reached_countries: z
    .array(z.string())
    .describe("Countries where ads were shown (ISO 2-letter codes, e.g. ['US','GB'])"),
  ad_active_status: z
    .enum(["ACTIVE", "INACTIVE", "ALL"])
    .optional()
    .describe("Filter by active status (default ACTIVE)"),
  media_type: z
    .enum(["ALL", "IMAGE", "MEME", "VIDEO", "NONE"])
    .optional()
    .describe("Filter by media type"),
  limit: z.number().optional().describe("Max results (default 25)"),
};

export const SearchPagesSchema = {
  query: z
    .string()
    .describe("Brand or company name to search for"),
  limit: z.number().optional().describe("Max results (default 10)"),
};

export const GetPageAdsSchema = {
  page_id: z
    .string()
    .describe("Facebook Page ID to get ads for"),
  countries: z
    .array(z.string())
    .describe("Countries (ISO 2-letter codes, e.g. ['US'])"),
  limit: z.number().optional().describe("Max results (default 25)"),
};
