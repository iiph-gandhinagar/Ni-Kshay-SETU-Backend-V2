import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PopulateOptions } from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { UserAppVersionDocument } from './entities/user-app-version.entity';

@Injectable()
export class UserAppVersionService {
  constructor(
    @InjectModel('UserAppVersion')
    private readonly userAppVersionModel: Model<UserAppVersionDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all User App Version');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'userId', select: 'name email phoneNo' }, // Populate countryId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.userAppVersionModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async getAllUserVersion(paginationDto: PaginationDto) {
    console.log('This action returns all User App Version without pagination');
    const query = await this.filterService.filter(paginationDto);
    const version = await this.userAppVersionModel
      .find(query)
      .populate({ path: 'userId', select: 'name email phoneNo' })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      'Get All User Version fetch successfully!!',
      version,
    );
  }
}
