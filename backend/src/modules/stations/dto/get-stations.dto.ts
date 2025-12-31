import { IsNumber, IsOptional } from 'class-validator';

export class GetStationsDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  radius?: number;
}