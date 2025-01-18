import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'Order successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        const userId = req.user.userId;
        return this.orderService.create(createOrderDto, userId);
    }

    @Get(':id')
    @Roles('admin') // Sólo los usuarios con el rol 'admin' pueden acceder a esta ruta
    @ApiOperation({ summary: 'Get a specific order' })
    @ApiResponse({ status: 200, description: 'Order details' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    async findOne(@Param('id') id: string, @Request() req) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        return this.orderService.findOne(id, userId, userRole);
    }
}
