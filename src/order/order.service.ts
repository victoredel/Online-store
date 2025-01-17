import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) { }

    // Crear una nueva orden
    async create(createOrderDto: CreateOrderDto, userId: string) {
        return this.prisma.order.create({
            data: {
                ...createOrderDto,
                userId,
            },
        });
    }

    // Listar las órdenes del usuario autenticado
    async findAll(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { products: true },
        });
    }

    // Detalles de una orden específica
    async findOne(id: string, userId: string, userRole: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { products: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId && userRole !== 'admin') {
            throw new ForbiddenException('You do not have access to this order');
        }

        return order;
    }
}
