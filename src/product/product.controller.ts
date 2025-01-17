import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({ status: 200, description: 'List of all products' })
    async findAll(@Query() query: any) {
        return this.productService.findAll(query);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Invalid input.' })
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productService.create(createProductDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update an existing product' })
    @ApiResponse({ status: 200, description: 'The product has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.update(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a product' })
    @ApiResponse({ status: 200, description: 'The product has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    async delete(@Param('id') id: string) {
        return this.productService.delete(id);
    }
}
