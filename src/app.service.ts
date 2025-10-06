import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('From app service');
    return 'Hello World! from app service';
  }
}
