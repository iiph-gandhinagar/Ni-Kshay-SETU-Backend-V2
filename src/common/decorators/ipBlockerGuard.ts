import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IpBlockerService } from '../../ipBlocker/ipBlocker.service';

@Injectable()
export class IpBlockerGuard implements CanActivate {
  constructor(private readonly ipBlockerService: IpBlockerService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip =
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress;
    const route = request.originalUrl || request.url;
    console.log('route--->', route);
    if (route === '/api') {
      return true;
    }

    this.ipBlockerService.checkIp(ip, route);
    return true;
  }
}
