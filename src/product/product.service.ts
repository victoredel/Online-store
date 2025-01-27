import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Order } from '@prisma/client';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }

    // Listar todos los productos con paginación y filtros
    async findAll(params: any) {
        const { skip, take, category, price } = params;

        // Validar los parámetros de paginación
        const skipNumber = skip ? parseInt(skip) : 0;
        const takeNumber = take ? parseInt(take) : 10;

        if (isNaN(skipNumber) || isNaN(takeNumber) || skipNumber < 0 || takeNumber <= 0) {
            throw new BadRequestException('Invalid pagination parameters');
        }

        // Filtrar productos por categoría y precio
        return this.prisma.product.findMany({
            where: {
                category: category || undefined,
                price: price ? { lte: parseFloat(price) } : undefined,
            },
            skip: skipNumber,
            take: takeNumber,
        });
    }

    // Crear un nuevo producto
    async create(createProductDto: CreateProductDto) {
        try {
            return await this.prisma.product.create({
                data: createProductDto,
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002' && error.meta.target) {
                    const target = error.meta.target as string[];
                    if (target.includes('name')) {
                        throw new ConflictException('Product name already exists');
                    }
                }
            }
            throw error;
        }
    }

    // Actualizar un producto existente
    async update(id: string, updateProductDto: UpdateProductDto) {

        try {
            return await this.prisma.product.update({
                where: { id },
                data: updateProductDto,
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException('Product not found');
                }
                if (error.code === 'P2002' && error.meta.target) {
                    const target = error.meta.target as string[];
                    if (target.includes('name')) {
                        throw new ConflictException('Product name already exists');
                    }
                }
            }
            throw error
        }
    }

    // Eliminar un producto
    async delete(id: string) {

        const totalOrders = await this.prisma.order.findMany({
            where: { products: { some: { id } } },
        }) as Order[];
        if ((totalOrders as Order[]).length > 0) {
            throw new ConflictException('Product is associated with orders');
        }
        try {
            return await this.prisma.product.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException('Product not found');
                }
            }
            throw error;
        }
    }
}
