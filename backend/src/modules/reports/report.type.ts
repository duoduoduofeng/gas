export type Report = {
  id: number;
  stationId: number;
  price: number;
  deviceId: string;
  photoUrl: string | null;
  createdAt: Date;
};