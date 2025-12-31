import { ReportDto } from '../../reports/dto/report.dto';

export class StationDetailDto {
  id!: number;
  name!: string;
  lat!: number;
  lng!: number;

  currentPrice!: number | null;
  confidence!: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reportCount!: number;
  lastUpdatedAt!: string | null; // ISO string

  recentReports!: ReportDto[];
}