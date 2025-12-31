const { getStationDetail } = require('../../utils/api');
const { toErrorMessage } = require('../../utils/format');
const { toStationHeader, toRecentReports } = require('../../utils/viewmodel');

Page({
  data: {
    stationId: null,
    loading: false,
    error: '',

    header: {
      name: '',
      badge: 'NONE',
      currentPriceText: '--',
      reportCount: 0,
      lastUpdatedText: '--'
    },

    reports: []
  },

  onLoad(query) {
    const id = query && query.id ? Number(query.id) : null;
    this.setData({ stationId: id });
    this.loadDetail();
  },

  onPullDownRefresh() {
    this.loadDetail().finally(() => wx.stopPullDownRefresh());
  },

  async onRefresh() {
    await this.loadDetail();
  },

  onGoReport() {
    const { stationId, currentPrice } = this.data;
    if (!stationId) return;

    const p = typeof currentPrice === 'number' ? currentPrice : '';
    const qPrice = p === '' ? '' : `&price=${encodeURIComponent(p)}`;

    wx.navigateTo({
      url: `/pages/report/report?stationId=${encodeURIComponent(stationId)}${qPrice}`
    });
  },

  async loadDetail() {
    const { stationId } = this.data;
    if (!stationId) {
      this.setData({ error: 'Missing stationId.' });
      return;
    }

    this.setData({ loading: true, error: '' });

    try {
      const raw = await getStationDetail(stationId);

      this.setData({
        currentPrice: typeof raw.currentPrice === 'number' ? raw.currentPrice : null,
        header: toStationHeader(raw),
        reports: toRecentReports(raw)
      });

      wx.setNavigationBarTitle({ title: raw.name || 'Station' });
      console.log('station detail:', raw);
    } catch (err) {
      console.error('loadDetail failed:', err);
      this.setData({ error: toErrorMessage(err) });
    } finally {
      this.setData({ loading: false });
    }
  }
});