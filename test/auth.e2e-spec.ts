import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';

describe('AuthController e2e - Comprehensive', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should successfully register a user', async () => {
      await pactum.spec()
        .post('/auth/register')
        .withBody({
          email: 'success@example.com',
          password: 'password123'
        })
        .expectStatus(201)
        .expectJsonLike({
          email: 'success@example.com'
        });
    });

    it('should throw a validation error if email is missing', async () => {
      await pactum.spec()
        .post('/auth/register')
        .withBody({
          password: 'password123'
        })
        .expectStatus(400)
        .expectBodyContains('email must be an email');
    });

    it('should throw a validation error if password is missing', async () => {
      await pactum.spec()
        .post('/auth/register')
        .withBody({
          email: 'test@example.com'
        })
        .expectStatus(400)
        .expectBodyContains('password should not be empty');
    });

    it('should throw an error if email already exists', async () => {
      await pactum.spec()
        .post('/auth/register')
        .withBody({
          email: 'test@example.com',
          password: 'password123'
        })
        .expectStatus(201);

      await pactum.spec()
        .post('/auth/register')
        .withBody({
          email: 'test@example.com',
          password: 'password123'
        })
        .expectStatus(409)
        .expectBodyContains('Email already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should successfully login a user', async () => {
      await pactum.spec()
        .post('/auth/register')
        .withBody({
          email: 'login@example.com',
          password: 'password123'
        })
        .expectStatus(201);

      await pactum.spec()
        .post('/auth/login')
        .withBody({
          email: 'login@example.com',
          password: 'password123'
        })
        .expectStatus(200)
        .expectJsonLike({
          accessToken: /.+/
        });
    });

    it('should throw a validation error if email is missing', async () => {
      await pactum.spec()
        .post('/auth/login')
        .withBody({
          password: 'password123'
        })
        .expectStatus(400)
        .expectBodyContains('email must be an email');
    });

    it('should throw a validation error if password is missing', async () => {
      await pactum.spec()
        .post('/auth/login')
        .withBody({
          email: 'test@example.com'
        })
        .expectStatus(400)
        .expectBodyContains('password should not be empty');
    });

    it('should throw an error if credentials are invalid', async () => {
      await pactum.spec()
        .post('/auth/login')
        .withBody({
          email: 'invalid@example.com',
          password: 'invalidpassword'
        })
        .expectStatus(401)
        .expectBodyContains('Invalid credentials');
    });
  });
});
