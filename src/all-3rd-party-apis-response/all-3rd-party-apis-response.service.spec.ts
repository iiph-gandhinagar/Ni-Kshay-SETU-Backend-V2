import { Test, TestingModule } from '@nestjs/testing';
import { All3rdPartyApisResponseService } from './all-3rd-party-apis-response.service';

describe('All3rdPartyApisResponseService', () => {
  let service: All3rdPartyApisResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [All3rdPartyApisResponseService],
    }).compile();

    service = module.get<All3rdPartyApisResponseService>(
      All3rdPartyApisResponseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
