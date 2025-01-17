
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { CreateOrderDto } from 'src/order/dto';

describe('OrderController e2e', () => {
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
                email: 'order@test.com',
                password: 'password123'
            });

        const res = await pactum.spec()
            .post('/auth/login')
            .withBody({
                email: 'order@test.com',
                password: 'password123'
            });

        accessToken = res.json('accessToken');
    });

    afterAll(async () => {
        await app.close();
    });

    it('/orders (POST) - create order', async () => {
        const createOrderDto: CreateOrderDto = {
            productIds: ['1', '2', '3'],
            totalPrice: 100
        };
        await pactum.spec()
            .post('/orders')
            .withHeaders('Authorization', `Bearer ${accessToken}`)
            .withBody(createOrderDto)
            .expectStatus(201);
    });

    it('/orders (GET) - get all orders', async () => {
        await pactum.spec()
            .get('/orders')
            .withHeaders('Authorization', `Bearer ${accessToken}`)
            .expectStatus(200)
            .expectJsonLength(1);
    });
});
