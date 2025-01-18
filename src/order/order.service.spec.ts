import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto';
import { Order, Prisma } from '@prisma/client';

jest.mock('../prisma/prisma.service');

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const expectedResult = {
  } as Order;
  expectedResult.id = '1';
  expectedResult.userId = 'user1';
  expectedResult.totalPrice = new Prisma.Decimal(100);

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        productIds: ['1', '2'],
        totalPrice: 200,
      };
      const userId = 'user1';
      const expectedOrder = { id: '1', userId, ...createOrderDto, products: [] };

      jest.spyOn(prismaService.order, 'create').mockResolvedValue(expectedOrder[0]);

      const result = await service.create(createOrderDto, userId);
    });
  });

  describe('findAll', () => {
    it('should return all orders for the authenticated user', async () => {
      const userId = 'user1';
      const orders = [expectedResult];

      jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(orders);

      const result = await service.findAll(userId);
      expect(result).toEqual(orders);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { products: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return the order for the authenticated user or admin', async () => {
      const orderId = '1';
      const userId = 'user1';
      const userRole = 'admin';

      jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(expectedResult);

      const result = await service.findOne(orderId, userId, userRole);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if order is not found', async () => {
      const orderId = '1';
      const userId = 'user1';
      const userRole = 'user';

      jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(orderId, userId, userRole)).rejects.toThrow(new NotFoundException('Order not found'));
    });

    it('should throw ForbiddenException if user is not the owner or admin', async () => {
      const orderId = '1';
      const orderOwnerId = 'user2';
      const order = { ...expectedResult, userId: orderOwnerId };

      jest.spyOn(prismaService.order, 'findUnique').mockResolvedValue(order);

      await expect(service.findOne(orderId, 'user1', 'user')).rejects.toThrow(new ForbiddenException('You do not have access to this order'));
    });
  });
});
