import { postReport } from "../services/api";
import { toErrorMessage } from "./format";
import { getOrCreateDeviceId } from "./device";

function buildCreateReportPayload(args: { stationId: number; price: number }) {
  return {
    stationId: args.stationId,
    price: args.price,
    deviceId: getOrCreateDeviceId(),
  };
}

export function mapReportError(err: any) {
  const status = err && err.statusCode;

  if (status === 429) return "Too many requests. Try again later.";
  if (status === 400) return "Invalid input.";
  if (status === 404) return "Station not found.";
  return toErrorMessage(err);
}

export async function submitReport(args: { stationId: number; price: number }) {
  const payload = buildCreateReportPayload(args);
  const res = await postReport(payload);
  return { res, payload };
}