const BASE_URL = 'http://localhost:3000';

function getStationById(stationId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/stations/${encodeURIComponent(stationId)}`,
      method: 'GET',
      success: (res) => resolve(res.data),
      fail: reject
    });
  });
}

function getStationsByGeo(lat, lng) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/stations`,
      method: 'GET',
      data: { lat, lng },
      success: (res) => resolve(res.data),
      fail: reject
    });
  });
}

function normalizeToArray(payload) {
  if (Array.isArray(payload)) return payload;

  const maybeData = payload && payload.data;
  if (Array.isArray(maybeData)) return maybeData;
  if (maybeData && typeof maybeData === 'object') return [maybeData];

  if (payload && typeof payload === 'object') return [payload];

  return [];
}

module.exports = {
  getStationById,
  getStationsByGeo,
  normalizeToArray
};