const STORAGE_KEY = 'deviceId';

function randomHex(len) {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < len; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

function generateDeviceId() {
  const a = randomHex(8);
  const b = randomHex(4);
  const c = randomHex(4);
  const d = randomHex(4);
  const e = randomHex(12);
  return `${a}-${b}-${c}-${d}-${e}`;
}

function getOrCreateDeviceId() {
  try {
    const existing = wx.getStorageSync(STORAGE_KEY);
    if (existing && typeof existing === 'string') return existing;

    const id = generateDeviceId();
    wx.setStorageSync(STORAGE_KEY, id);
    return id;
  } catch (e) {
    return `fallback-${Date.now()}-${randomHex(8)}`;
  }
}

module.exports = {
  getOrCreateDeviceId
};