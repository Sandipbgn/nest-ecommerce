import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'users/decorators/roles.decorator';
import { RequestWithUser } from 'users/decorators/user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('requiredRoles', requiredRoles);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // If no roles are required, allow access
    }
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    console.log('user in roles guard', user);
    if (!user) {
      return false; // If there's no user in the request, deny access
    }

    return requiredRoles.includes(user.role);
  }
}
