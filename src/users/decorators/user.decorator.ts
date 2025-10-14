import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  //TODO: We need to update this type once we attach more info of user from database in authguard
  user: { id: string; email: string };
}

export const LoggedInUser = createParamDecorator(
  (data: keyof RequestWithUser['user'], context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return data ? user[data] : user;
  },
);
