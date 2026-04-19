import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderWithItems, orderInclude } from './order.mapper';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderWithItems | null> {
    try {
      const uniqueIds = [...new Set(dto.items.map((i) => i.productId))];
      const products = await this.prisma.product.findMany({
        where: { id: { in: uniqueIds } },
      });

      if (products.length !== uniqueIds.length) {
        console.error('Order create failed: one or more products not found');
        return null;
      }

      const productById = new Map(products.map((p) => [p.id, p]));
      const totalQtyByProduct = new Map<string, number>();
      for (const line of dto.items) {
        totalQtyByProduct.set(
          line.productId,
          (totalQtyByProduct.get(line.productId) ?? 0) + line.quantity,
        );
      }

      for (const [productId, qty] of totalQtyByProduct) {
        const p = productById.get(productId);
        if (!p || p.stock < qty) {
          console.error(
            `Order create failed: insufficient stock for product ${productId}`,
          );
          return null;
        }
      }

      let totalPrice = 0;
      for (const line of dto.items) {
        const p = productById.get(line.productId)!;
        totalPrice += p.price * line.quantity;
      }

      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            totalPrice,
            items: {
              create: dto.items.map((line) => {
                const p = productById.get(line.productId)!;
                return {
                  productId: line.productId,
                  quantity: line.quantity,
                  price: p.price,
                };
              }),
            },
          },
          include: orderInclude,
        });

        for (const [productId, qty] of totalQtyByProduct) {
          await tx.product.update({
            where: { id: productId },
            data: { stock: { decrement: qty } },
          });
        }

        return order;
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  async findAll(
    page?: number,
    limit?: number,
    viewer?: { userId: string; role: Role },
  ): Promise<OrderWithItems[] | null> {
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;

    try {
      const where =
        viewer?.role === Role.ADMIN
          ? {}
          : { userId: viewer!.userId };

      const orders = await this.prisma.order.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      });

      return orders;
    } catch (err) {
      console.error(`On orders service findAll: ${err}`);
      return null;
    }
  }

  async findOne(
    id: string,
    viewer?: { userId: string; role: Role },
  ): Promise<OrderWithItems | null> {
    try {
      const where =
        viewer?.role === Role.ADMIN
          ? { id }
          : { id, userId: viewer!.userId };

      const order = await this.prisma.order.findFirst({
        where,
        include: orderInclude,
      });

      return order;
    } catch (err) {
      console.error(`On orders service findOne: ${err}`);
      return null;
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderWithItems | null> {
    try {
      const updated = await this.prisma.order.update({
        where: { id },
        data: {
          status: updateOrderDto.status,
        },
        include: orderInclude,
      });

      return updated;
    } catch (err) {
      console.error(`On orders service update: ${err}`);
      return null;
    }
  }
}
