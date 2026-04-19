import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const product = await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          stock: createProductDto.stock,
          category: createProductDto.category,
        },
      });
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async findAll(page?: number, limit?: number) {
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    try {
      const products = await this.prisma.product.findMany({
        skip: (safePage - 1) * safeLimit, // offset
        take: safeLimit, // limit
        orderBy: {
          createdAt: 'desc', // optional: newest first
        },
      });

      return products;
    } catch (err) {
      console.error(`On products service findAll: ${err}`);
      return null;
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.product.findUnique({
        where: { id },
      });
    } catch (err) {
      console.error(`On products service findOne: ${err}`);
      return null;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name: updateProductDto.name,
          description: updateProductDto.description,
          price: updateProductDto.price,
          stock: updateProductDto.stock,
          category: updateProductDto.category,
        },
      });

      return updatedProduct;
    } catch (err) {
      console.error(`On products service update: ${err}`);
      return null;
    }
  }

  async remove(id: string) {
    try {
      const deletedProduct = await this.prisma.product.delete({
        where: { id },
      });

      return deletedProduct;
    } catch (err) {
      console.error(`On products service remove: ${err}`);
      return null;
    }
  }
}
