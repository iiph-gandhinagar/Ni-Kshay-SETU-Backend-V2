import { Test, TestingModule } from '@nestjs/testing';
import { TemporaryTokenService } from './temporary-token.service';

describe('TemporaryTokenService', () => {
  let service: TemporaryTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemporaryTokenService],
    }).compile();

    service = module.get<TemporaryTokenService>(TemporaryTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
