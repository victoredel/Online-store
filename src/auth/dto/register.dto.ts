import { IsEmail, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    role?: string;
}
