const { postReport } = require('./api');
const { toErrorMessage } = require('./format');
const { getOrCreateDeviceId } = require('./device');

function buildCreateReportPayload({ stationId, price }) {
  return {
    stationId,
    price,
    deviceId: getOrCreateDeviceId()
  };
}

function mapReportError(err) {
  const status = err && err.statusCode;

  if (status === 429) return 'Too many requests. Try again later.';
  if (status === 400) return 'Invalid input.';
  if (status === 404) return 'Station not found.';
  return toErrorMessage(err);
}

async function submitReport({ stationId, price }) {
  const payload = buildCreateReportPayload({ stationId, price });
  const res = await postReport(payload);
  return { res, payload };
}

module.exports = {
  submitReport,
  mapReportError
};