// utils/location.js
const STORAGE_KEY = 'selected_location_v1';

function isValidLatLng(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

function loadSelectedLocation() {
  try {
    const loc = wx.getStorageSync(STORAGE_KEY);
    if (!loc) return null;
    if (!isValidLatLng(loc.lat, loc.lng)) return null;
    return loc;
  } catch (e) {
    return null;
  }
}

function saveSelectedLocation(loc) {
  if (!loc || !isValidLatLng(loc.lat, loc.lng)) return;
  wx.setStorageSync(STORAGE_KEY, loc);
}

function clearSelectedLocation() {
  wx.removeStorageSync(STORAGE_KEY);
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => resolve({ lat: res.latitude, lng: res.longitude, source: 'gps' }),
      fail: (err) => {
        console.error('getLocation fail:', err);
        reject(err);
      },
    });
  });
}

function chooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        resolve({
          lat: res.latitude,
          lng: res.longitude,
          name: res.name || '',
          address: res.address || '',
          source: 'picked',
        });
      },
      fail: reject,
    });
  });
}

async function getPreferredLocation() {
  const picked = loadSelectedLocation();
  if (picked) return picked;
  return await getCurrentLocation();
}

module.exports = {
  loadSelectedLocation,
  saveSelectedLocation,
  clearSelectedLocation,
  getCurrentLocation,
  chooseLocation,
  getPreferredLocation,
};