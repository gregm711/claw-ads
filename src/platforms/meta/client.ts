import { URL, URLSearchParams } from "url";
import { ApiError } from "../../utils/errors.js";
import type { PlatformMetricsProvider } from "../types.js";

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
}

export class MetaClient implements PlatformMetricsProvider {
  name = "meta" as const;

  private accessToken: string;
  private apiVersion: string;
  private baseUrl: string;

  constructor(accessToken: string, apiVersion: string, baseUrl: string) {
    this.accessToken = accessToken;
    this.apiVersion = apiVersion;
    this.baseUrl = baseUrl;
  }

  // ── Core request method ───────────────────────────────────────────

  private async request<T = unknown>(
    endpoint: string,
    opts: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", params = {}, body } = opts;
    const url = new URL(`${this.baseUrl}/${this.apiVersion}/${endpoint}`);

    // Always attach access token
    url.searchParams.set("access_token", this.accessToken);

    // Add query params (GET requests and filters)
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }

    const fetchOpts: RequestInit = { method };

    if (body && method === "POST") {
      fetchOpts.headers = { "Content-Type": "application/json" };
      fetchOpts.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), fetchOpts);
    const json = await res.json();

    if (!res.ok) {
      throw new ApiError(
        `Meta API request failed: ${endpoint}`,
        res.status,
        json
      );
    }

    return json as T;
  }

  // ── Ad Accounts ───────────────────────────────────────────────────

  async listAdAccounts() {
    return this.request<{ data: MetaAdAccount[] }>("me/adaccounts", {
      params: {
        fields:
          "id,name,account_id,account_status,currency,timezone_name,balance,amount_spent",
      },
    });
  }

  // ── Campaigns ─────────────────────────────────────────────────────

  async listCampaigns(accountId: string, limit = 25) {
    return this.request<{ data: MetaCampaign[]; paging?: MetaPaging }>(
      `${accountId}/campaigns`,
      {
        params: {
          fields:
            "id,name,status,objective,buying_type,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time,created_time,updated_time",
          limit,
        },
      }
    );
  }

  async getCampaign(campaignId: string) {
    return this.request<MetaCampaign>(campaignId, {
      params: {
        fields:
          "id,name,status,objective,buying_type,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time,bid_strategy,special_ad_categories,created_time,updated_time",
      },
    });
  }

  async createCampaign(
    accountId: string,
    params: {
      name: string;
      objective: string;
      status?: string;
      special_ad_categories?: string[];
      daily_budget?: number;
      lifetime_budget?: number;
      bid_strategy?: string;
    }
  ) {
    const body: Record<string, unknown> = {
      name: params.name,
      objective: params.objective,
      status: params.status || "PAUSED",
      special_ad_categories: params.special_ad_categories || [],
    };

    if (params.daily_budget) body.daily_budget = params.daily_budget;
    if (params.lifetime_budget) body.lifetime_budget = params.lifetime_budget;
    if (params.bid_strategy) body.bid_strategy = params.bid_strategy;

    return this.request<{ id: string }>(
      `${accountId}/campaigns`,
      { method: "POST", body }
    );
  }

  async updateCampaign(
    campaignId: string,
    params: Record<string, unknown>
  ) {
    return this.request<{ success: boolean }>(campaignId, {
      method: "POST",
      body: params,
    });
  }

  // ── Ad Sets ───────────────────────────────────────────────────────

  async listAdSets(
    parentId: string,
    parentType: "account" | "campaign" = "campaign",
    limit = 25
  ) {
    const endpoint =
      parentType === "account"
        ? `${parentId}/adsets`
        : `${parentId}/adsets`;

    return this.request<{ data: MetaAdSet[]; paging?: MetaPaging }>(
      endpoint,
      {
        params: {
          fields:
            "id,name,status,daily_budget,lifetime_budget,bid_amount,billing_event,optimization_goal,targeting,start_time,end_time,created_time",
          limit,
        },
      }
    );
  }

  async getAdSet(adSetId: string) {
    return this.request<MetaAdSet>(adSetId, {
      params: {
        fields:
          "id,name,status,campaign_id,daily_budget,lifetime_budget,bid_amount,bid_strategy,billing_event,optimization_goal,targeting,promoted_object,start_time,end_time,created_time,updated_time",
      },
    });
  }

  async createAdSet(
    accountId: string,
    params: {
      name: string;
      campaign_id: string;
      billing_event: string;
      optimization_goal: string;
      daily_budget?: number;
      lifetime_budget?: number;
      bid_amount?: number;
      bid_strategy?: string;
      targeting: Record<string, unknown>;
      status?: string;
      start_time?: string;
      end_time?: string;
      promoted_object?: Record<string, unknown>;
    }
  ) {
    return this.request<{ id: string }>(`${accountId}/adsets`, {
      method: "POST",
      body: {
        ...params,
        status: params.status || "PAUSED",
      },
    });
  }

  async updateAdSet(
    adSetId: string,
    params: Record<string, unknown>
  ) {
    return this.request<{ success: boolean }>(adSetId, {
      method: "POST",
      body: params,
    });
  }

  // ── Ads ───────────────────────────────────────────────────────────

  async listAds(
    parentId: string,
    parentType: "adset" | "campaign" = "adset",
    limit = 25
  ) {
    return this.request<{ data: MetaAd[]; paging?: MetaPaging }>(
      `${parentId}/ads`,
      {
        params: {
          fields:
            "id,name,status,adset_id,campaign_id,creative,created_time,updated_time",
          limit,
        },
      }
    );
  }

  async createAd(
    accountId: string,
    params: {
      name: string;
      adset_id: string;
      creative: { creative_id: string };
      status?: string;
    }
  ) {
    return this.request<{ id: string }>(`${accountId}/ads`, {
      method: "POST",
      body: {
        ...params,
        status: params.status || "PAUSED",
      },
    });
  }

  async updateAd(adId: string, params: Record<string, unknown>) {
    return this.request<{ success: boolean }>(adId, {
      method: "POST",
      body: params,
    });
  }

  // ── Creatives ─────────────────────────────────────────────────────

  async listCreatives(accountId: string, limit = 25) {
    return this.request<{ data: MetaCreative[]; paging?: MetaPaging }>(
      `${accountId}/adcreatives`,
      {
        params: {
          fields:
            "id,name,status,title,body,image_url,thumbnail_url,object_story_spec,call_to_action_type,link_url",
          limit,
        },
      }
    );
  }

  async createAdCreative(
    accountId: string,
    params: {
      name: string;
      object_story_spec: Record<string, unknown>;
    }
  ) {
    return this.request<{ id: string }>(`${accountId}/adcreatives`, {
      method: "POST",
      body: params,
    });
  }

  // ── Audiences ─────────────────────────────────────────────────────

  async listAudiences(accountId: string, limit = 25) {
    return this.request<{ data: MetaAudience[]; paging?: MetaPaging }>(
      `${accountId}/customaudiences`,
      {
        params: {
          fields:
            "id,name,description,subtype,approximate_count,data_source,delivery_status,operation_status",
          limit,
        },
      }
    );
  }

  async createCustomAudience(
    accountId: string,
    params: {
      name: string;
      description?: string;
      subtype: string;
      customer_file_source?: string;
      rule?: Record<string, unknown>;
      lookalike_spec?: Record<string, unknown>;
    }
  ) {
    return this.request<{ id: string }>(`${accountId}/customaudiences`, {
      method: "POST",
      body: params,
    });
  }

  // ── Insights / Analytics ──────────────────────────────────────────

  async getInsights(
    objectId: string,
    params: {
      date_preset?: string;
      time_range?: { since: string; until: string };
      breakdowns?: string;
      level?: string;
      fields?: string;
    } = {}
  ) {
    const defaultFields =
      "impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type";

    const queryParams: Record<string, string | number | boolean | undefined> = {
      fields: params.fields || defaultFields,
      level: params.level,
      breakdowns: params.breakdowns,
    };

    if (params.time_range) {
      queryParams.time_range = JSON.stringify(params.time_range);
    } else {
      queryParams.date_preset = params.date_preset || "last_30d";
    }

    return this.request<{ data: MetaInsight[] }>(
      `${objectId}/insights`,
      { params: queryParams }
    );
  }

  // ── Ad Library (Competitor Research) ──────────────────────────────

  async searchAdLibrary(params: {
    search_terms?: string;
    search_page_ids?: string[];
    ad_reached_countries: string[];
    ad_active_status?: string;
    ad_type?: string;
    media_type?: string;
    limit?: number;
    fields?: string;
  }) {
    const defaultFields =
      "id,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_captions,ad_delivery_start_time,ad_delivery_stop_time,page_id,page_name,publisher_platforms,estimated_audience_size,impressions,spend";

    const queryParams: Record<string, string | number | boolean | undefined> = {
      search_terms: params.search_terms,
      ad_reached_countries: JSON.stringify(params.ad_reached_countries),
      ad_active_status: params.ad_active_status || "ACTIVE",
      ad_type: params.ad_type || "ALL",
      fields: params.fields || defaultFields,
      limit: params.limit || 25,
    };

    if (params.search_page_ids) {
      queryParams.search_page_ids = JSON.stringify(params.search_page_ids);
    }
    if (params.media_type) {
      queryParams.media_type = params.media_type;
    }

    return this.request<{ data: MetaAdLibraryResult[]; paging?: MetaPaging }>(
      "ads_archive",
      { params: queryParams }
    );
  }

  async searchPages(query: string, limit = 10) {
    return this.request<{ data: MetaPage[] }>("pages/search", {
      params: { q: query, limit },
    });
  }

  async getPageAds(
    pageId: string,
    countries: string[],
    limit = 25
  ) {
    return this.searchAdLibrary({
      search_page_ids: [pageId],
      ad_reached_countries: countries,
      limit,
    });
  }

  // ── PlatformMetricsProvider (cross-platform interface) ────────────

  async getSpendSummary(startDate: string, endDate: string) {
    const accounts = await this.listAdAccounts();
    let totalSpend = 0;
    let currency = "USD";
    const campaigns: { name: string; spend: number; status: string }[] = [];

    for (const account of accounts.data) {
      currency = account.currency || "USD";
      const campaignData = await this.listCampaigns(account.id);
      for (const campaign of campaignData.data) {
        try {
          const insights = await this.getInsights(campaign.id, {
            time_range: { since: startDate, until: endDate },
          });
          const spend = insights.data?.[0]
            ? parseFloat(insights.data[0].spend || "0")
            : 0;
          totalSpend += spend;
          campaigns.push({
            name: campaign.name,
            spend,
            status: campaign.status,
          });
        } catch {
          // Campaign may not have insights data
          campaigns.push({
            name: campaign.name,
            spend: 0,
            status: campaign.status,
          });
        }
      }
    }

    return { totalSpend, currency, campaigns };
  }

  async getPerformanceSummary(startDate: string, endDate: string) {
    const accounts = await this.listAdAccounts();
    let impressions = 0;
    let clicks = 0;
    let spend = 0;
    let conversions = 0;

    for (const account of accounts.data) {
      try {
        const insights = await this.getInsights(account.id, {
          time_range: { since: startDate, until: endDate },
          level: "account",
        });
        if (insights.data?.[0]) {
          const d = insights.data[0];
          impressions += parseInt(d.impressions || "0", 10);
          clicks += parseInt(d.clicks || "0", 10);
          spend += parseFloat(d.spend || "0");
          // Extract conversions from actions array
          const conversionAction = d.actions?.find(
            (a: { action_type: string }) =>
              a.action_type === "offsite_conversion" ||
              a.action_type === "purchase"
          );
          if (conversionAction) {
            conversions += parseInt(conversionAction.value || "0", 10);
          }
        }
      } catch {
        // skip accounts without data
      }
    }

    return { impressions, clicks, spend, conversions };
  }
}

// ── Meta API Types ────────────────────────────────────────────────────

interface MetaPaging {
  cursors?: { before: string; after: string };
  next?: string;
  previous?: string;
}

interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  balance: string;
  amount_spent: string;
}

interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  buying_type: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  start_time?: string;
  stop_time?: string;
  bid_strategy?: string;
  special_ad_categories?: string[];
  created_time: string;
  updated_time: string;
}

interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  bid_amount?: number;
  bid_strategy?: string;
  billing_event: string;
  optimization_goal: string;
  targeting: Record<string, unknown>;
  promoted_object?: Record<string, unknown>;
  start_time?: string;
  end_time?: string;
  created_time: string;
  updated_time?: string;
}

interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  campaign_id: string;
  creative: { id: string };
  created_time: string;
  updated_time: string;
}

interface MetaCreative {
  id: string;
  name: string;
  status?: string;
  title?: string;
  body?: string;
  image_url?: string;
  thumbnail_url?: string;
  object_story_spec?: Record<string, unknown>;
  call_to_action_type?: string;
  link_url?: string;
}

interface MetaAudience {
  id: string;
  name: string;
  description?: string;
  subtype: string;
  approximate_count: number;
  data_source?: Record<string, unknown>;
  delivery_status?: Record<string, unknown>;
  operation_status?: Record<string, unknown>;
}

interface MetaInsight {
  impressions?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  reach?: string;
  frequency?: string;
  actions?: { action_type: string; value: string }[];
  cost_per_action_type?: { action_type: string; value: string }[];
  date_start?: string;
  date_stop?: string;
  [key: string]: unknown;
}

interface MetaAdLibraryResult {
  id: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_captions?: string[];
  ad_delivery_start_time?: string;
  ad_delivery_stop_time?: string;
  page_id?: string;
  page_name?: string;
  publisher_platforms?: string[];
  estimated_audience_size?: Record<string, unknown>;
  impressions?: Record<string, unknown>;
  spend?: Record<string, unknown>;
}

interface MetaPage {
  id: string;
  name: string;
  link?: string;
  category?: string;
}
