import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import config from 'config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRoot({
      //use variables from config
      // @ts-expect-error dbType from env is string but TypeORM expects specific union
      type: config().database.dbType,
      host: config().database.host,
      port: config().database.port,
      username: config().database.username,
      password: config().database.password,
      autoLoadEntities: true,
      database: config().database.databaseName,
      synchronize: false,
    }),
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
