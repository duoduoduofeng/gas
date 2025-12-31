const APP_CONFIG = require('../config/app.config');

function request({ path, method = 'GET', data }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${APP_CONFIG.api.baseUrl}${path}`,
      method,
      data,
      success: (res) => {
        const status = res.statusCode || 0;
        if (status >= 200 && status < 300) {
          resolve(res.data);
        } else {
          const err = new Error(`HTTP_${status}`);
          err.statusCode = status;
          err.payload = res.data;
          reject(err);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function getStations({ lat, lng, radius }) {
  return request({
    path: '/stations',
    method: 'GET',
    data: { lat, lng, radius }
  });
}

function getStationDetail(id) {
  return request({
    path: `/stations/${encodeURIComponent(id)}`,
    method: 'GET'
  });
}

function postReport({ stationId, price, deviceId, photoUrl }) {
  return request({
    path: '/reports',
    method: 'POST',
    data: { stationId, price, deviceId, photoUrl }
  });
}

module.exports = {
  request,
  getStations,
  getStationDetail,
  postReport
};