const APP_CONFIG = require('../config/app.config');

function parsePrice(priceText) {
  const n = Number(priceText);
  if (!Number.isFinite(n)) return { ok: false, value: null, error: 'Invalid price.' };
  return { ok: true, value: n, error: '' };
}

function validateReport({ stationId, price }) {
  if (!stationId || !Number.isFinite(stationId)) {
    return { ok: false, error: 'Missing stationId.' };
  }

  if (!Number.isFinite(price)) {
    return { ok: false, error: 'Invalid price.' };
  }

  if (price < APP_CONFIG.report.minPrice || price > APP_CONFIG.report.maxPrice) {
    return { ok: false, error: 'Price out of range.' };
  }

  return { ok: true, error: '' };
}

module.exports = {
  parsePrice,
  validateReport
};