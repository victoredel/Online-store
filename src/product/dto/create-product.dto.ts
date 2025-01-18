import { IsNotEmpty, IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Product Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 'Electronics' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  stock: number;
}
