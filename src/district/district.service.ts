import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { DistrictDocument } from './entities/district.entity';

@Injectable()
export class DistrictService {
  constructor(
    @InjectModel('District')
    private readonly districtModel: Model<DistrictDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<DistrictDocument> {
    console.log('inside find by property District----->');
    return this.districtModel.findOne({ [property]: value }).exec();
  }
  async create(createDistrictDto: CreateDistrictDto) {
    console.log('This action adds a new District');
    createDistrictDto.countryId = new mongoose.Types.ObjectId(
      createDistrictDto.countryId,
    );
    createDistrictDto.stateId = new mongoose.Types.ObjectId(
      createDistrictDto.stateId,
    );
    const newDistrict = await this.districtModel.create(createDistrictDto);
    return this.baseResponse.sendResponse(
      200,
      message.district.DISTRICT_CREATED,
      newDistrict,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all District');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
      { path: 'stateId', select: 'title' }, // Populate stateId and select only the name field
    ];
    const query = await this.filterService.filter(paginationDto);
    const updatedQuery = await this.adminService.adminRoleFilter(
      userId,
      query,
      'district',
    );
    return await paginate(
      this.districtModel,
      paginationDto,
      statePopulateOptions,
      updatedQuery,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} District`);
    const getDistrictById = await this.districtModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.district.DISTRICT_LIST,
      getDistrictById,
    );
  }

  async update(id: string, updateDistrictDto: UpdateDistrictDto) {
    console.log(`This action updates a #${id} District`);
    const updateDetails = await this.districtModel.findByIdAndUpdate(
      id,
      updateDistrictDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.district.DISTRICT_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} District`);
    const subscriber = await this.subscriberModel.findOne({ districtId: id });
    if (subscriber) {
      throw new HttpException(
        {
          message: "Can't Delete District!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.districtModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.district.DISTRICT_DELETE,
      [],
    );
  }
}
