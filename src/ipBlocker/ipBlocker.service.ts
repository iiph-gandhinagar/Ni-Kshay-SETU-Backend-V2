import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class IpBlockerService {
  private requestCounts = new Map<
    string,
    { count: number; lastRequest: number }
  >();
  private readonly LIMIT = 10; // Limit of requests 7 times
  private readonly TTL = 60 * 1000; // Time in milliseconds 60*1000(1 minute), 86,400,000 (24*3600000)(per day)

  checkIp(ip: string, apiPath: string) {
    const currentTime = Date.now();
    const key = `${ip}_${apiPath}`;

    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 1, lastRequest: currentTime });
      return;
    }
    const record = this.requestCounts.get(key);

    // Reset if TTL has passed
    if (currentTime - record.lastRequest > this.TTL) {
      record.count = 1;
      record.lastRequest = currentTime;
      return;
    }

    // Check if the limit is exceeded
    if (record.count >= this.LIMIT) {
      throw new HttpException(
        'Too many requests from this IP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
    record.lastRequest = currentTime;
  }
}
