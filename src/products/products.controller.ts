import {
  Body,
  Controller,
  Get,
  Param,
  // Delete,
  // ForbiddenException,
  // Get,
  // HttpStatus,
  // Param,
  // ParseIntPipe,
  Post,
  Put,
  // Put,
  // Query,
  // Req,
  // Res,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

// import express from 'express';
// import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post('/')
  addProduct(@Body() productBody: CreateProductDto) {
    return this.productService.addProduct(productBody);
  }

  @Put('/:id')
  updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id') id: string,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Get('/')
  getAllProducts(): Promise<Product[]> {
    return this.productService.getAllProducts();
  }

  @Get('/:id')
  getOneProduct(@Param('id') id: string): Promise<Product | null> {
    return this.productService.getOneProduct(id);
  }

  // @Post()
  // createProduct(
  //   @Req() req: express.Request,
  //   @Res() res: express.Response,

  //   @Body('name') name: string,
  //   @Body('price') price: number,
  // ): void {
  //   console.log(req);
  //   console.log(name, price);

  //   res.status(HttpStatus.CREATED).send({
  //     message: `Product ${name} with price ${price} created successfully!`,
  //   });

  //   // return `Product ${name} with price ${price} created successfully!`;
  // }

  // @Post('/create')
  // addProduct(@Body() createProductDto: CreateProductDto) {
  //   console.log(createProductDto);
  // }

  // @Put('/:id')
  // updateProduct(@Param('id') id: string, @Query('data') data: string): string {
  //   if (id === 'hello') {
  //     throw new ForbiddenException('you are not allowed to update hello');
  //   }
  //   return `Hello from put request and id is ${id} and data is ${data}`;
  // }

  // @Delete('/:id')
  // deleteProduct(@Param('id', ParseIntPipe) id: number): string {
  //   console.log(typeof id);
  //   return `Hello from delete request and id is ${id}`;
  // }
}
