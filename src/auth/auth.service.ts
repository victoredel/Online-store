import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    async register(registerDto: RegisterDto) {
        try {
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            return await this.prisma.user.create({
                data: {
                    email: registerDto.email,
                    hash: hashedPassword,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002' && error.meta.target) {
                    const target = error.meta.target as string[];
                    // Prisma error code for unique constraint violation on email
                    if (target.includes('email')) {
                        throw new ConflictException('Email already exists');
                    }
                }
            }
            throw error;
        }
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
        if (!user || !(await bcrypt.compare(loginDto.password, user.hash))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
