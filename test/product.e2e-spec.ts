import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { CreateProductDto, UpdateProductDto } from 'src/product/dto';

describe('ProductController e2e - Comprehensive', () => {
    let app: INestApplication;
    let server: any;
    let accessToken: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        server = app.getHttpServer();
        pactum.request.setBaseUrl('http://localhost:3000');

        // Register and login to get access token
        await pactum.spec()
            .post('/auth/register')
            .withBody({
                email: 'product@test.com',
                password: 'password123'
            });

        const res = await pactum.spec()
            .post('/auth/login')
            .withBody({
                email: 'product@test.com',
                password: 'password123'
            });

        accessToken = res.json('accessToken');
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /products', () => {
        it('should successfully create a product', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Test Product',
                price: 19.99,
                category: "category",
                stock: 100
            };

            await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(createProductDto)
                .expectStatus(201)
                .expectJsonLike({
                    name: 'Test Product',
                    price: 19.99,
                });
        });

        it('should throw a validation error if name is missing', async () => {
            await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    price: 19.99
                })
                .expectStatus(400)
                .expectBodyContains('name should not be empty');
        });

        it('should throw a validation error if price is missing', async () => {
            await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    name: 'Test Product'
                })
                .expectStatus(400)
                .expectBodyContains('price should not be empty');
        });

        it('should throw a validation error if price is less than 0', async () => {
            await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    name: 'Test Product',
                    price: -1
                })
                .expectStatus(400)
                .expectBodyContains('price must not be less than 0');
        });

        it('should throw a validation error if stock is missing', async () => {
            await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    name: 'Test Product',
                    price: 19.99
                })
                .expectStatus(400)
                .expectBodyContains('stock should not be empty');
        });

        it('should throw a validation error if stock is less than 0', async () => {
            await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    name: 'Test Product',
                    price: 19.99,
                    stock: -1
                })
                .expectStatus(400)
                .expectBodyContains('stock must not be less than 0');
        });
    });

    describe('GET /products', () => {
        it('should get all products', async () => {
            await pactum.spec()
                .get('/products')
                .expectStatus(200)
                .expectJsonLike([{ name: 'Test Product' }]);
        });
        
    });

    describe('PUT /products/:id', () => {
        it('should successfully update a product', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Product to Update',
                price: 29.99,
                category: "category",
                stock: 100
            };

            const res = await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(createProductDto)
                .expectStatus(201);

            const productId = res.json('id');

            const updateProductDto: UpdateProductDto = {
                name: 'Updated Product',
                price: 39.99,
            };

            await pactum.spec()
                .put(`/products/${productId}`)
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(updateProductDto)
                .expectStatus(200)
                .expectJsonLike({
                    name: 'Updated Product',
                    price: 39.99,
                });
        });

        it('should throw a validation error if name is missing', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Product to Fail Update',
                price: 29.99,
                category: "category",
                stock: 100
            };

            const res = await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(createProductDto)
                .expectStatus(201);

            const productId = res.json('id');

            await pactum.spec()
                .put(`/products/${productId}`)
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    price: 39.99
                })
                .expectStatus(400)
                .expectBodyContains('name should not be empty');
        });

        it('should throw an error if product not found', async () => {
            const updateProductDto: UpdateProductDto = {
                name: 'Nonexistent Product',
                price: 39.99,
            };

            await pactum.spec()
                .put('/products/invalid-id')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(updateProductDto)
                .expectStatus(404)
                .expectBodyContains('Product not found');
        });

        it('should throw a validation error if price is less than 0', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Product to Fail Update',
                price: 29.99,
                category: "category",
                stock: 100
            };

            const res = await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(createProductDto)
                .expectStatus(201);

            const productId = res.json('id');

            await pactum.spec()
                .put(`/products/${productId}`)
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    name: 'Updated Product',
                    price: -1
                })
                .expectStatus(400)
                .expectBodyContains('price must not be less than 0');
        });

        it('should throw a validation error if stock is less than 0', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Product to Fail Update',
                price: 29.99,
                category: "category",
                stock: 100
            };

            const res = await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(createProductDto)
                .expectStatus(201);

            const productId = res.json('id');

            await pactum.spec()
                .put(`/products/${productId}`)
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    name: 'Updated Product',
                    price: 39.99,
                    stock: -1
                })
                .expectStatus(400)
                .expectBodyContains('stock must not be less than 0');
        });

    });

    describe('DELETE /products/:id', () => {
        it('should successfully delete a product', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Product to Delete',
                price: 29.99,
                category: "category",
                stock: 100
            };

            const res = await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(createProductDto)
                .expectStatus(201);

            const productId = res.json('id');

            await pactum.spec()
                .delete(`/products/${productId}`)
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .expectStatus(200);
        });

        it('should throw an error if product not found', async () => {
            await pactum.spec()
                .delete('/products/invalid-id')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .expectStatus(404)
                .expectBodyContains('Product not found');
        });

        it('should throw an error if product has orders', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Product with Orders',
                price: 29.99,
                category: "category",
                stock: 100
            };

            const res = await pactum.spec()
                .post('/products')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody(createProductDto)
                .expectStatus(201);

            const productId = res.json('id');

            await pactum.spec()
                .post('/orders')
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .withBody({
                    products: [{ productId, quantity: 1 }]
                });

            await pactum.spec()
                .delete(`/products/${productId}`)
                .withHeaders('Authorization', `Bearer ${accessToken}`)
                .expectStatus(400)
                .expectBodyContains('Product has orders');
        });
    });
});
