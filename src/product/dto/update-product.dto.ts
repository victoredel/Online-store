import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'Updated Product Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated Product Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 119.99, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 'Home Appliances', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;
}
