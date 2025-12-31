export type Report = {
  id: number;
  stationId: number;
  price: number;
  photoUrl?: string | null;
  createdAt: Date;
};