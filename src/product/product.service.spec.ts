import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

  let expectedResult = [{
  }] as Product[];
  expectedResult[0].price = new Prisma.Decimal(100);
  expectedResult[0].category = 'electronics';
  expectedResult[0].stock = 10;
  expectedResult[0].name = 'Product 1';
  expectedResult[0].description = 'Test Description';
  expectedResult[0].createdAt = new Date();
  expectedResult[0].updatedAt = new Date();
  describe('findAll', () => {
    it('should return products with valid pagination parameters', async () => {
      const params = { skip: '0', take: '10', category: 'electronics', price: '100' };

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(expectedResult);

      const result = await service.findAll(params);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException for invalid skip parameter', async () => {
      const params = { skip: '-1', take: '10' };

      await expect(service.findAll(params)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid take parameter', async () => {
      const params = { skip: '0', take: '0' };

      await expect(service.findAll(params)).rejects.toThrow(BadRequestException);
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
  let paramsError = {} as {
    code: string;
    meta: Record<string, unknown>;
    clientVersion: string;
    batchRequestIdx?: number;
  }
  paramsError.code = 'P2002';
  let error = new PrismaClientKnownRequestError('Unique constraint failed', paramsError);

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Product Description',
        price: 150,
        stock: 20,
        category: 'new category'
      };

      jest.spyOn(prismaService.product, 'create').mockResolvedValue(expectedResult[0]);

      const result = await service.create(createProductDto);
      expect(result).toEqual(expectedResult[0]);
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });
    });

    it('should throw ConflictException if product name already exists', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Existing Product',
        description: 'Existing Product Description',
        price: 150,
        stock: 20,
        category: 'existing category'
      };
      error.meta = { target: ['name'] };

      jest.spyOn(prismaService.product, 'create').mockRejectedValue(error);

      await expect(service.create(createProductDto)).rejects.toThrow(new ConflictException('Product name already exists'));
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 200,
        stock: 15,
        category: 'updated category'
      };

      jest.spyOn(prismaService.product, 'update').mockResolvedValue(expectedResult[0]);

      const result = await service.update('1', updateProductDto);
      expect(result).toEqual(expectedResult[0]);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateProductDto,
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Nonexistent Product',
        description: 'Nonexistent Description',
        price: 200,
        stock: 15,
        category: 'nonexistent category'
      };
      jest.spyOn(prismaService.product, 'update').mockRejectedValue(new NotFoundException('Product not found'));

      await expect(service.update('nonexistent_id', updateProductDto)).rejects.toThrow(new NotFoundException('Product not found'));
    });

    it('should throw ConflictException if updated product name already exists', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Existing Product Name',
        description: 'Updated Description',
        price: 200,
        stock: 15,
        category: 'updated category'
      };
      error.meta = { target: ['name'] };

      jest.spyOn(prismaService.product, 'update').mockRejectedValue(error);

      await expect(service.update('1', updateProductDto)).rejects.toThrow(new ConflictException('Product name already exists'));
    });
  });

  describe('delete', () => {
    it('should delete an existing product', async () => {

      jest.spyOn(prismaService.product, 'delete').mockResolvedValue(expectedResult[0]);

      const result = await service.delete('1');
      expect(result).toEqual(expectedResult[0]);
      expect(prismaService.product.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(prismaService.product, 'delete').mockResolvedValue(null);

      await expect(service.delete('nonexistent_id')).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });
});
