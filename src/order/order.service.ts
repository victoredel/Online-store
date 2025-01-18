import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) { }

    // Crear una nueva orden

    async create(createOrderDto: CreateOrderDto, userId: string) {
        try {
            return await this.prisma.order.create({
                data: {
                    products: {
                        connect: createOrderDto.productIds.map(id => ({ id })),
                    },
                    totalPrice: createOrderDto.totalPrice,
                    userId,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new Error('Foreign key constraint failed. One or more product IDs do not exist.');
                }
                // Manejo de otros códigos de error específicos de Prisma
                // Puedes añadir más condiciones aquí según los códigos de error que desees manejar
                else {
                    throw new ForbiddenException('An unexpected error occurred. Please try again.');
                }
            }
        }
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
