// Design for station detail page.
export class ReportDto {
  id!: number;
  stationId!: number;
  price!: number;
  deviceId!: string;
  photoUrl!: string | null;
  createdAt!: string; // ISO string
}