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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('Products') // Group all these endpoints under "Products" in Swagger
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiBearerAuth('JWT-auth') // Tells Swagger this route requires the padlock token
  @ApiOperation({ summary: 'Create a new product (Admin only)' }) // Add a summary for this endpoint in Swagger
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Admins only.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  create(@Body() createProductDto: CreateProductDto) {
    const product = this.productsService.create(createProductDto);
    if (!product) {
      throw new InternalServerErrorException('Failed to create product');
    }
    return product;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
