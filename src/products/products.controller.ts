import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductMapper } from './product.mapper';
import { ErrorResponseDto } from 'src/dto/error-response.dto';

@ApiTags('Products') // Group all these endpoints under "Products" in Swagger
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiBearerAuth('JWT-auth') // Tells Swagger this route requires the padlock token
  @ApiOperation({ summary: 'Create a new product (Admin only)' }) // Add a summary for this endpoint in Swagger
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.create(createProductDto);
    if (!product) {
      throw new InternalServerErrorException('Failed to create product');
    }
    return ProductMapper.toDto(product);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all products' }) // Add a summary for this endpoint in Swagger
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll(page, limit);
    if (!products) {
      throw new InternalServerErrorException('Failed to find product');
    }
    return products.map((product) => ProductMapper.toDto(product));
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    format: 'uuid',
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return ProductMapper.toDto(product);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product by id (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    format: 'uuid',
  })
  @ApiResponse({ status: 201, type: UpdateProductDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, updateProductDto);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return ProductMapper.toDto(product);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product by id (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.remove(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return ProductMapper.toDto(product);
  }
}
