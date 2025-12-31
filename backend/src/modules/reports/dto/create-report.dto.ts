import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  stationId!: number;

  @IsNumber()
  @Min(0.1)
  @Max(10)
  price!: number;

  @IsString()
  deviceId!: string;

  // The reporter can choose to upload a photo or not.
  @IsOptional()
  @IsString()
  photoUrl?: string;
}