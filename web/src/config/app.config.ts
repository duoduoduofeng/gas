const ENV = {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  logLevel: (import.meta.env.VITE_LOG_LEVEL || "info") as
    | "debug"
    | "info"
    | "warn"
    | "error",
};

const APP_CONFIG = {
  env: ENV,

  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    defaults: {
      radiusKm: 5,
      lat: 49.17,
      lng: -123.13,
    },
  },

  ui: {
    toastDurationMs: 2000,
  },

  report: {
    minPrice: 0.5,
    maxPrice: 5.0,
    priceStep: 0.01,
    defaultPrice: 1.5,
    decimals: 2,
  },

  price: {
    decimals: 2,
    placeholder: "--",
  },

  station: {
    recentReportsLimit: 10,
    showDeviceId: false,
  },

  nearby: {
    radiusOptionsKm: [5, 10, 15],
    maxItems: 50,
  },

  time: {
    showRelative: false,
  },

  logging: {
    enabled: ENV.logLevel !== "error",
    level: ENV.logLevel,
    allowDebug: ENV.logLevel === "debug",
  },
} as const;

export default APP_CONFIG;