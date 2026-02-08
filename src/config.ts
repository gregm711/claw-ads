export interface PlatformConfig {
  name: string;
  enabled: boolean;
}

export interface ClawAdsConfig {
  meta?: {
    accessToken: string;
    apiVersion: string;
    baseUrl: string;
  };
  // Future platforms:
  // google?: { developerToken: string; clientId: string; refreshToken: string; };
  // tiktok?: { accessToken: string; };
  // x?: { accessToken: string; accessSecret: string; };
  // reddit?: { accessToken: string; };
}

export function loadConfig(): ClawAdsConfig {
  const config: ClawAdsConfig = {};

  if (process.env.META_ACCESS_TOKEN) {
    config.meta = {
      accessToken: process.env.META_ACCESS_TOKEN,
      apiVersion: process.env.META_API_VERSION || "v23.0",
      baseUrl: process.env.META_BASE_URL || "https://graph.facebook.com",
    };
  }

  return config;
}

export function getEnabledPlatforms(config: ClawAdsConfig): string[] {
  const platforms: string[] = [];
  if (config.meta) platforms.push("meta");
  return platforms;
}
