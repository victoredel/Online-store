import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: ['productId1', 'productId2'], description: 'List of product IDs' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({ example: 199.99, description: 'Total price of the order' })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}
