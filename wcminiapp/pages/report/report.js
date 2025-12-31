const APP_CONFIG = require('../../config/app.config');
const { validateReport } = require('../../utils/validators');
const { submitReport, mapReportError } = require('../../utils/report.service');
const { backAndRefreshPrevious } = require('../../utils/navigation');

Page({
  data: {
    stationId: null,

    // price state
    price: APP_CONFIG.report.defaultPrice,
    defaultPrice: APP_CONFIG.report.defaultPrice,

    // config for price-stepper
    minPrice: APP_CONFIG.report.minPrice,
    maxPrice: APP_CONFIG.report.maxPrice,
    priceStep: APP_CONFIG.report.priceStep,
    decimals: APP_CONFIG.report.decimals,

    submitting: false,
    error: ''
  },

  onLoad(query) {
    const stationId = query && query.stationId ? Number(query.stationId) : null;

    const qPrice = query && query.price !== undefined ? Number(query.price) : NaN;
    const initialPrice = Number.isFinite(qPrice) ? qPrice : APP_CONFIG.report.defaultPrice;

    this.setData({ stationId, price: initialPrice });

    if (!stationId) {
      this.setData({ error: 'Missing stationId.' });
    }

    console.log('report init:', this.data);
  },

  onPriceChange(e) {
    const v = e.detail.value; // number | null
    this.setData({
      price: v,
      error: ''
    });
  },

  async onSubmit() {
    if (this.data.submitting) return;

    const { stationId, price } = this.data;
    if (price === null) {
      this.setData({ error: 'Invalid price.' });
      return;
    }
    const check = validateReport({ stationId, price });

    if (!check.ok) {
      this.setData({ error: check.error });
      return;
    }

    this.setData({ submitting: true, error: '' });

    try {
      await submitReport({ stationId, price });

      wx.showToast({
        title: 'Submitted',
        icon: 'success',
        duration: APP_CONFIG.ui.toastDurationMs
      });

      backAndRefreshPrevious(['loadDetail', 'onRefresh']);
    } catch (err) {
      console.error('submit report failed:', err);
      this.setData({ error: mapReportError(err) });
    } finally {
      this.setData({ submitting: false });
    }
  }
});