import { Product } from '@prisma/client';
import { ProductResponseDto } from './dto/product-response.dto';

export class ProductMapper {
  static toDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      price: product.price,
      stock: product.stock,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
