import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        }
      }
    })
  }
  async cleanDb() {
    return this.$transaction([
      this.user.deleteMany(),
      this.product.deleteMany(),
      this.order.deleteMany(),
    ])
  }
}


