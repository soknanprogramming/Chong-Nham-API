import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  InternalServerErrorException,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderMapper } from './order.mapper';
import { ErrorResponseDto } from 'src/dto/error-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { ValidatedUser } from 'src/auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Place a new order' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  async create(
    @CurrentUser() user: ValidatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.create(user.userId, createOrderDto);
    if (!order) {
      throw new InternalServerErrorException('Failed to create order');
    }
    return OrderMapper.toDto(order);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List orders (all orders for admins, own orders for customers)',
  })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @CurrentUser() user: ValidatedUser,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.ordersService.findAll(page, limit, user);
    if (!orders) {
      throw new InternalServerErrorException('Failed to find orders');
    }
    return orders.map((order) => OrderMapper.toDto(order));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get order by id (admins: any order; customers: only their orders)',
  })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    format: 'uuid',
  })
  async findOne(
    @CurrentUser() user: ValidatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.findOne(id, user);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return OrderMapper.toDto(order);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.update(id, updateOrderDto);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return OrderMapper.toDto(order);
  }
}
