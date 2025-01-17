import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';

// Mock PrismaService with Jest
jest.mock('../prisma/prisma.service');

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const expectedResult = [{}] as Product[];
  expectedResult[0].price = new Prisma.Decimal(100);
  expectedResult[0].category = 'electronics';
  expectedResult[0].stock = 10;
  expectedResult[0].name = 'Product 1';
  expectedResult[0].description = 'Test Description';
  describe('findAll', () => {
    it('should return products with valid pagination parameters', async () => {
      const params = { skip: '0', take: '10', category: 'electronics', price: '100' };
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(expectedResult);

      const result = await service.findAll(params);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException for invalid skip parameter', async () => {
      const params = { skip: '-1', take: '10' };

      await expect(service.findAll(params)).rejects.toThrow(new BadRequestException('Invalid pagination parameters'));
    });

    it('should throw BadRequestException for invalid take parameter', async () => {
      const params = { skip: '0', take: '0' };

      await expect(service.findAll(params)).rejects.toThrow(new BadRequestException('Invalid pagination parameters'));
    });

    it('should filter products by category and price', async () => {
      const params = { skip: '0', take: '10', category: 'electronics', price: '100' };

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(expectedResult);

      const result = await service.findAll(params);
      expect(result).toEqual(expectedResult);
    });

    it('should handle missing optional parameters', async () => {
      const params = { skip: '0', take: '10' };

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(expectedResult);

      const result = await service.findAll(params);
      expect(result).toEqual(expectedResult);
    });
  });
});
