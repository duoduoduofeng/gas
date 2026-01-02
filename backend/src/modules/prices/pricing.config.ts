/**
 * Pricing & confidence rules configuration
 * All time values are in minutes
 */
export const PRICING_CONFIG = {
  // Search radius by location(latitude, longitude)
  NEARBY: {
    RADIUS: 5,
  },

  // Time windows used for price freshness
  WINDOWS: {
    HIGH: 30, // fresh window
    LOW: 60,  // degraded window
  },

  // Report count thresholds for confidence levels
  THRESHOLDS: {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  },

  // Anti-spam / rate limit rules
  DEFENSE: {
    MAX_UPLOAD_TIMES: 5,
    WINDOW_MINUTES: 5,
  },

  // Deduplication rules
  DEDUP: {
    PRICE_EPSILON: 0.001,
    WINDOW_MINUTES: 2,
  },

  OUTLIER: {
    // A report is considered an outlier if it deviates from median by more than this ratio.
    // Example: 0.2 means ±20%
    MAX_DEVIATION_RATIO: 0.2,

    // Minimum number of reports required to apply outlier filtering
    MIN_REPORTS: 3,
  },
} as const;