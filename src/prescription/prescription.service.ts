import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PrescriptionDocument } from './entities/prescription.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel('Prescription')
    private readonly prescriptionModel: Model<PrescriptionDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    console.log(`This action returns all prescription`);
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.prescriptionModel, paginationDto, [], query);
  }

  async prescriptionReport(paginationDto: PaginationDto) {
    console.log(`This action returns all prescription report`);
    const query = await this.filterService.filter(paginationDto);
    const data = await this.prescriptionModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
    return this.baseResponse.sendResponse(200, 'Prescription Report!!', data);
  }
}
