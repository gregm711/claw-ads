// Minimal shared interface for cross-platform metrics rollups.
// Each platform client implements this so xplat_ tools can aggregate.
export interface PlatformMetricsProvider {
  name: string;

  getSpendSummary(
    startDate: string,
    endDate: string
  ): Promise<{
    totalSpend: number;
    currency: string;
    campaigns: { name: string; spend: number; status: string }[];
  }>;

  getPerformanceSummary(
    startDate: string,
    endDate: string
  ): Promise<{
    impressions: number;
    clicks: number;
    spend: number;
    conversions?: number;
  }>;
}
