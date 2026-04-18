import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { Category } from '@prisma/client';
import { Optional } from '@nestjs/common';

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  name!: string;

  @ApiProperty({
    required: false,
    description: 'Detailed description of the product',
  })
  @IsString()
  @Optional()
  description?: string;

  @ApiProperty({ description: 'Price of the product' })
  @IsNumber()
  price!: number;

  @ApiProperty({ default: 0, description: 'Available stock quantity' })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ enum: Category, description: 'Category of the product' })
  @IsEnum(Category)
  category!: Category;
}
