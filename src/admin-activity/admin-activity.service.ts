import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateAdminActivityDto } from './dto/create-admin-activity.dto';
import { AdminActivityDocument } from './entities/admin-activity.entity';

@Injectable()
export class AdminActivityService {
  constructor(
    @InjectModel('AdminActivity')
    private readonly adminActivityModel: Model<AdminActivityDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}
  async create(createAdminActivityDto: CreateAdminActivityDto, userId: string) {
    console.log('This action adds a new admin activity');
    createAdminActivityDto.causerId = new mongoose.Types.ObjectId(userId);
    const newAdminActivity = await this.adminActivityModel.create(
      createAdminActivityDto,
    );
    return this.baseResponse.sendResponse(
      200,
      'Admin Activity created Successfully',
      newAdminActivity,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all admin activity');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'causerId', select: 'firstName LastName email' }, // Populate countryId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.adminActivityModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async getAllActivity(paginationDto: PaginationDto) {
    console.log(`This action returns all admin activity without pagination`);

    const query = await this.filterService.filter(paginationDto);
    const adminActivity = await this.adminActivityModel
      .find(query)
      .populate({ path: 'causerId', select: 'firstName LastName email' })
      .select('-payload')
      .exec();
    return this.baseResponse.sendResponse(
      200,
      'Admin Activity fetch successfully!',
      adminActivity,
    );
  }
}
