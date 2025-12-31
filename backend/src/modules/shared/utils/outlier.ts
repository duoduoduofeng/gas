/**
 * Median of a numeric array.
 */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Check whether a value is an outlier compared to median.
 */
export function isOutlierByMedian(
  value: number,
  medianValue: number,
  maxDeviationRatio: number,
): boolean {
  if (medianValue <= 0) return false;

  const ratio = Math.abs(value - medianValue) / medianValue;
  return ratio > maxDeviationRatio;
}

/**
 * Filter outliers based on median deviation ratio.
 */
export function filterOutliersByMedian<T>(
  items: T[],
  getValue: (item: T) => number,
  maxDeviationRatio: number,
  minReports: number,
): { kept: T[]; dropped: T[]; medianValue: number | null } {
  if (items.length < minReports) {
    return { kept: items, dropped: [], medianValue: null };
  }

  const values = items.map(getValue);
  const m = median(values);
  if (m === null || m <= 0) {
    return { kept: items, dropped: [], medianValue: m };
  }

  const kept: T[] = [];
  const dropped: T[] = [];

  for (const item of items) {
    const v = getValue(item);
    if (isOutlierByMedian(v, m,maxDeviationRatio)) dropped.push(item);
    else kept.push(item);
  }

  return { kept, dropped, medianValue: m };
}