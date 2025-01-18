# Online Store

This repository contains the source code for a comprehensive online store application built with NestJS. The project includes API endpoints for user management, product catalog, order processing, and more.

## Key Features

- **User Authentication:** Secure login and registration functionalities.
- **Product Management:** CRUD operations for products, including categories and inventory.
- **Order Processing:** Handling of customer orders from creation to fulfillment.
- **API Documentation:** Available at `/api` for detailed information about endpoints.

## Technologies Used

- **NestJS:** A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript:** For static typing and improved development experience.
- **PostgreSQL:** As the database for storing application data.
- **Swagger:** For API documentation.

## Project setup

```bash
npm install --legacy-peer-deps
npx prisma migrate dev
npm run build
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test

# watch mode
$ npm run test:dev
```

## Environment Setup

Make sure to set the following environment variables in your `.env` file:

```plaintext
# PostgreSQL Database URL
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=<SCHEMA>"

# JWT Secret Key
JWT_SECRET="<YOUR_SECRET_KEY>"

# PostgreSQL User
POSTGRES_USER="<YOUR_POSTGRES_USER>"

# PostgreSQL Password
POSTGRES_PASSWORD="<YOUR_POSTGRES_PASSWORD>"

# PostgreSQL Database Name
POSTGRES_DB="<YOUR_POSTGRES_DB>"
```

## Important Notice

⚠️ **Important:** To manage products or orders, you must be logged in as an admin user. Regular users do not have the necessary permissions to perform these actions.

## API Documentation

To access our API documentation, please visit our [documentation page](https://online-store-kwhx.onrender.com/api). You will find detailed information about all available endpoints, request and response examples, and much more.

## Stay in touch

- Author - [Victor Edel Vivas Diaz](https://linkedin/in/victoredel)
- Website - [https://online-store-kwhx.onrender.com](https://online-store-kwhx.onrender.com)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
