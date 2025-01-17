import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        const userId = req.user.id;
        return this.orderService.create(createOrderDto, userId);
    }

    @Get()
    async findAll(@Request() req) {
        const userId = req.user.id;
        return this.orderService.findAll(userId);
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async findOne(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        const userRole = req.user.role;
        return this.orderService.findOne(id, userId, userRole);
    }
}
