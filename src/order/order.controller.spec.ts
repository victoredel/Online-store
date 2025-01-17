import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Order, Prisma } from '@prisma/client';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .overrideGuard(RolesGuard)
      .useValue({})
      .compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  let expectedResult = {} as Order;
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

      jest.spyOn(orderService, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(createOrderDto, { user: { id: userId } });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all orders for the authenticated user', async () => {
      const userId = 'user1';

      jest.spyOn(orderService, 'findAll').mockResolvedValue(expectedResult[0]);

      const result = await controller.findAll({ user: { id: userId } });
      expect(result).toEqual(expectedResult[0]);
    });
  });

  describe('findOne', () => {
    it('should return the order for the authenticated user or admin', async () => {
      const orderId = '1';
      const userId = 'user1';
      const userRole = 'admin';
      const expectedResult = { id: '1', userId, productIds: ['1'], totalPrice: 100 };

      jest.spyOn(orderService, 'findOne').mockResolvedValue(expectedResult[0]);

      const result = await controller.findOne(orderId, { user: { id: userId, role: userRole } });
      expect(result).toEqual(expectedResult[0]);
    });
  });
});
