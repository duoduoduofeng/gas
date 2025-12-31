const APP_CONFIG = {
  api: {
    baseUrl: 'http://localhost:3000',
    defaults: {
      radiusKm: 5,
      lat: 49.17,
      lng: -123.13
    }
  },

  ui: {
    toastDurationMs: 2000
  },

  report: {
    minPrice: 0.5,
    maxPrice: 5.0,
    priceStep: 0.01,
    defaultPrice: 1.50,
    decimals: 2
  },

  price: {
    decimals: 2,
    placeholder: '--'
  },

  station: {
    recentReportsLimit: 10,
    showDeviceId: false
  },

  nearby: {
    radiusOptionsKm: [5, 10, 15],
    maxItems: 50
  },

  time: {
    showRelative: false
  }
};

module.exports = APP_CONFIG;