import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminAuthGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    if (user.role === 'subscriber') {
      throw new UnauthorizedException('Admin access only');
    }
    return true;
  }
}
