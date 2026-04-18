import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  stock!: number;

  @ApiProperty({ enum: Category })
  category!: Category;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
