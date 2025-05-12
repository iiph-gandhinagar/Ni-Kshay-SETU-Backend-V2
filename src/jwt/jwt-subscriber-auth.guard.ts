import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './jwt-auth.guard';

@Injectable()
export class SubscriberAuthGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    if (user.role !== 'subscriber') {
      throw new UnauthorizedException('Subscriber access only');
    }
    return true;
  }
}
