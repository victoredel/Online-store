import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Product } from '@prisma/client';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .overrideGuard(RolesGuard)
      .useValue({})
      .compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = [{} as Product];
      jest.spyOn(productService, 'findAll').mockResolvedValue(result);

      expect(await productController.findAll({})).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = { name: 'Test Product', price: 100, category: 'Test Category', stock: 10 };
      const result = {} as Product;
      jest.spyOn(productService, 'create').mockResolvedValue(result);

      expect(await productController.create(createProductDto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = { name: 'Updated Product', price: 150 };
      const result = {} as Product;
      jest.spyOn(productService, 'update').mockResolvedValue(result);

      expect(await productController.update('1', updateProductDto)).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const result = {} as Product;
      jest.spyOn(productService, 'delete').mockResolvedValue(result);

      expect(await productController.delete('1')).toBe(result);
    });
  });
});