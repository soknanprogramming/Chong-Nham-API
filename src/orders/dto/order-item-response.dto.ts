import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty({
    description: 'Product name at time of response (from catalog)',
  })
  productName!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ description: 'Unit price snapshot at order time' })
  price!: number;
}
