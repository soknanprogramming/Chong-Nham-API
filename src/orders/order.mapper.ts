import { Prisma } from '@prisma/client';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';

const orderInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true },
      },
    },
  },
} as const;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export { orderInclude };

export class OrderMapper {
  static toDto(order: OrderWithItems): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(
        (item): OrderItemResponseDto => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
        }),
      ),
    };
  }
}
