const APP_CONFIG = require('../../config/app.config');
const { getStations } = require('../../utils/api');
const { toErrorMessage } = require('../../utils/format');
const { toNearbyStations } = require('../../utils/viewmodel');

Page({
  data: {
    lat: APP_CONFIG.api.defaults.lat,
    lng: APP_CONFIG.api.defaults.lng,
    radius: APP_CONFIG.api.defaults.radiusKm,

    radiusOptionsKm: APP_CONFIG.nearby.radiusOptionsKm,
    radiusOptions: APP_CONFIG.nearby.radiusOptionsKm.map(v => `${v} km`),

    stations: [],

    loading: false,
    error: ''
  },

  onLoad() {
    this.loadStations();
  },

  onPullDownRefresh() {
    this.loadStations().finally(() => wx.stopPullDownRefresh());
  },

  async onRefresh() {
    await this.loadStations();
  },

  async onRadiusChange(e) {
    const index = Number(e.detail.value);
    const radius = this.data.radiusOptionsKm[index];
    this.setData({ radius });
    await this.loadStations();
  },

  onOpenStation(e) {
    const id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    wx.navigateTo({ url: `/pages/station/station?id=${encodeURIComponent(id)}` });
  },

  async loadStations() {
    this.setData({ loading: true, error: '' });

    try {
      const { lat, lng, radius } = this.data;
      const raw = await getStations({ lat, lng, radius });
      const stations = toNearbyStations(raw);
      this.setData({ stations });
      console.log('nearby stations:', stations);
    } catch (err) {
      console.error('loadStations failed:', err);
      this.setData({ error: toErrorMessage(err) });
    } finally {
      this.setData({ loading: false });
    }
  }
});