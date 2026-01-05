export class StationListItemDto {
  id!: number;
  name!: string;
  lat!: number;
  lng!: number;
  // address?: string;
  address!: string | null;

  currentPrice!: number | null;
  confidence!: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reportCount!: number;
  lastUpdatedAt!: string | null; // ISO string
}