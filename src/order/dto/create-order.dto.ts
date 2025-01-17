import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}
