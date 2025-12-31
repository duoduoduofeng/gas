import { PRICING_CONFIG } from './pricing.config';

function assertPositiveInt(name: string, value: unknown) {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(`PRICING_CONFIG invalid: ${name} must be a positive integer`);
  }
}

function assertNonNegativeNumber(name: string, value: unknown) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(`PRICING_CONFIG invalid: ${name} must be a non-negative number`);
  }
}

export function validatePricingConfig() {
  const c = PRICING_CONFIG;

  // WINDOWS
  assertPositiveInt('WINDOWS.HIGH', c.WINDOWS.HIGH);
  assertPositiveInt('WINDOWS.LOW', c.WINDOWS.LOW);
  if (c.WINDOWS.LOW < c.WINDOWS.HIGH) {
    throw new Error('PRICING_CONFIG invalid: WINDOWS.LOW must be >= WINDOWS.HIGH');
  }

  // THRESHOLDS
  assertPositiveInt('THRESHOLDS.HIGH', c.THRESHOLDS.HIGH);
  assertPositiveInt('THRESHOLDS.MEDIUM', c.THRESHOLDS.MEDIUM);
  assertPositiveInt('THRESHOLDS.LOW', c.THRESHOLDS.LOW);
  if (
    c.THRESHOLDS.HIGH < c.THRESHOLDS.MEDIUM ||
    c.THRESHOLDS.MEDIUM < c.THRESHOLDS.LOW
  ) {
    throw new Error(
      'PRICING_CONFIG invalid: THRESHOLDS must satisfy HIGH >= MEDIUM >= LOW',
    );
  }

  // DEFENSE
  assertPositiveInt('DEFENSE.MAX_UPLOAD_TIMES', c.DEFENSE.MAX_UPLOAD_TIMES);
  assertPositiveInt('DEFENSE.WINDOW_MINUTES', c.DEFENSE.WINDOW_MINUTES);

  // DEDUP
  assertPositiveInt('DEDUP.WINDOW_MINUTES', c.DEDUP.WINDOW_MINUTES);
  assertNonNegativeNumber('DEDUP.PRICE_EPSILON', c.DEDUP.PRICE_EPSILON);
}