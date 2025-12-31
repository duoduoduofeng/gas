const APP_CONFIG = require('../config/app.config');
const { formatPrice, formatTime } = require('./format');

function toNearbyStations(rawList) {
  const list = Array.isArray(rawList) ? rawList : (rawList && rawList.data) || [];
  return list.slice(0, APP_CONFIG.nearby.maxItems).map((s) => ({
    id: s.id,
    name: s.name || '',
    confidence: s.confidence || 'NONE',
    reportCount: s.reportCount || 0,
    currentPriceText: formatPrice(s.currentPrice),
    lastUpdatedText: formatTime(s.lastUpdatedAt)
  }));
}

function toStationHeader(detail) {
  return {
    name: detail.name || '',
    badge: detail.confidence || 'NONE',
    currentPriceText: formatPrice(detail.currentPrice),
    reportCount: detail.reportCount || 0,
    lastUpdatedText: formatTime(detail.lastUpdatedAt)
  };
}

function toRecentReports(detail) {
  const recent = Array.isArray(detail.recentReports) ? detail.recentReports : [];
  return recent.slice(0, APP_CONFIG.station.recentReportsLimit).map((r) => ({
    id: r.id,
    priceText: formatPrice(r.price),
    timeText: formatTime(r.createdAt),
    deviceId: r.deviceId || '',
    photoUrl: r.photoUrl || null
  }));
}

module.exports = {
  toNearbyStations,
  toStationHeader,
  toRecentReports
};