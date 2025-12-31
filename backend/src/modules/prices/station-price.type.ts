export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type StationPrice = {
  stationId: number;
  price: number;
  confidence: ConfidenceLevel;
  reportCount: number;
  lastUpdatedAt: Date;
};