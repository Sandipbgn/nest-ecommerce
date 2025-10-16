import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CustomBody = createParamDecorator(
  (data: unknown, context: ExecutionContext): unknown => {
    const request = context.switchToHttp().getRequest<Request>();
    if (typeof data === 'string') {
      return (request.body as Record<string, unknown>)?.[data];
    }
    return request.body as unknown;
  },
);
