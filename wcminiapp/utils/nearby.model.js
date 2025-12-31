// utils/nearby.model.js
const { getStations } = require('./api');
const { toNearbyStations } = require('./viewmodel');
const { toErrorMessage } = require('./format');
const {
  getPreferredLocation,
  getCurrentLocation,
  chooseLocation,
  saveSelectedLocation,
  clearSelectedLocation,
} = require('./location');

async function buildState({ loc, radius }) {
  const raw = await getStations({ lat: loc.lat, lng: loc.lng, radius });
  return {
    lat: loc.lat,
    lng: loc.lng,
    stations: toNearbyStations(raw),
    locationStatus: 'ready',
    locationSource: loc.source || '',
    locationName: loc.name || '',
    error: '',
  };
}

async function initNearby({ radius }) {
  try {
    const loc = await getPreferredLocation();
    return await buildState({ loc, radius });
  } catch (err) {
    return {
      stations: [],
      locationStatus: 'denied',
      error: toErrorMessage(err),
    };
  }
}

async function refreshNearby({ lat, lng, radius }) {
  try {
    const raw = await getStations({ lat, lng, radius });
    return {
      stations: toNearbyStations(raw),
      error: '',
    };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

async function useMyLocation({ radius }) {
  try {
    clearSelectedLocation();
    const loc = await getCurrentLocation();
    return await buildState({ loc, radius });
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

async function pickLocation({ radius }) {
  try {
    const loc = await chooseLocation();
    saveSelectedLocation(loc);
    return await buildState({ loc, radius });
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

module.exports = {
  initNearby,
  refreshNearby,
  useMyLocation,
  pickLocation,
};