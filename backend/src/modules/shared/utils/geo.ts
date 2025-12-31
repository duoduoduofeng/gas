/**
 * Whether the object is within the distance range.
 */
export function isWithinRadius(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radiusKm: number,
): boolean {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const distance = Math.sqrt(dLat * dLat + dLng * dLng);

  return distance <= radiusKm / 100; // toy example
}