const APP_CONFIG = require('../../config/app.config');
const {
  initNearby,
  refreshNearby,
  useMyLocation,
  pickLocation,
} = require('../../utils/nearby.model');

function isNumber(n) {
  return typeof n === 'number' && !Number.isNaN(n);
}

Page({
  data: {
    lat: null,
    lng: null,
    radius: APP_CONFIG.api.defaults.radiusKm,

    radiusOptionsKm: APP_CONFIG.nearby.radiusOptionsKm,
    radiusOptions: APP_CONFIG.nearby.radiusOptionsKm.map(v => `${v} km`),

    stations: [],
    locationStatus: 'loading', // 'loading' | 'ready' | 'denied'
    locationSource: '', // 'gps' | 'picked'
    locationName: '',

    loading: false,
    error: '',
  },

  async onLoad() {
    await this.runWithLoading(async () => {
      const state = await initNearby({ radius: this.data.radius });
      this.applyState(state, { devHintOnDenied: true });
    });
  },

  onPullDownRefresh() {
    this.onRefresh().finally(() => wx.stopPullDownRefresh());
  },

  async onRadiusChange(e) {
    const index = Number(e.detail.value);
    const radius = this.data.radiusOptionsKm[index];

    await this.runWithLoading(async () => {
      this.setData({ radius });

      const { lat, lng } = this.data;
      if (!isNumber(lat) || !isNumber(lng)) {
        const state = await initNearby({ radius });
        this.applyState(state, { devHintOnDenied: true });
        return;
      }

      const state = await refreshNearby({ lat, lng, radius });
      this.applyState(state);
    });
  },

  async onUseMyLocation() {
    await this.runWithLoading(async () => {
      const state = await useMyLocation({ radius: this.data.radius });
      this.applyState(state, { devHintOnDenied: true });
    });
  },

  async onChooseLocation() {
    await this.runWithLoading(async () => {
      const state = await pickLocation({ radius: this.data.radius });
      this.applyState(state);
    });
  },

  async onRefresh() {
    await this.runWithLoading(async () => {
      const { lat, lng, radius } = this.data;

      if (!isNumber(lat) || !isNumber(lng)) {
        const state = await initNearby({ radius });
        this.applyState(state, { devHintOnDenied: true });
        return;
      }

      const state = await refreshNearby({ lat, lng, radius });
      this.applyState(state);
    });
  },

  onOpenStation(e) {
    const id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;

    // Optional: pass current location to station page for future use (distance, refresh consistency)
    const { lat, lng } = this.data;
    const params = [`id=${encodeURIComponent(id)}`];

    if (isNumber(lat) && isNumber(lng)) {
      params.push(`lat=${encodeURIComponent(String(lat))}`);
      params.push(`lng=${encodeURIComponent(String(lng))}`);
    }

    wx.navigateTo({ url: `/pages/station/station?${params.join('&')}` });
  },

  // ---- helpers ----

  async runWithLoading(fn) {
    this.setData({ loading: true });
    try {
      await fn();
    } finally {
      this.setData({ loading: false });
    }
  },

  applyState(state, opts = {}) {
    const devHintOnDenied = !!opts.devHintOnDenied;

    const patch = { ...state };

    if (typeof patch.lat === 'number' && typeof patch.lng === 'number') {
      patch.locationCoordText = `${patch.lat.toFixed(2)}, ${patch.lng.toFixed(2)}`;
    }

    if (
      devHintOnDenied &&
      patch.locationStatus === 'denied' &&
      typeof patch.error === 'string' &&
      patch.error
    ) {
      patch.error = patch.error + ' (Tip: In DevTools, set a simulated location or use "Choose location".)';
    }

    this.setData(patch);
  }
});