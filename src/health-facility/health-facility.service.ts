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
import { CreateHealthFacilityDto } from './dto/create-health-facility.dto';
import { UpdateHealthFacilityDto } from './dto/update-health-facility.dto';
import { HealthFacilityDocument } from './entities/health-facility.entity';

@Injectable()
export class HealthFacilityService {
  constructor(
    @InjectModel('HealthFacility')
    private readonly HealthFacilityModel: Model<HealthFacilityDocument>,
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
  ): Promise<HealthFacilityDocument> {
    console.log('inside find by property Health Facility----->');
    return this.HealthFacilityModel.findOne({ [property]: value }).exec();
  }

  async create(createHealthFacilityDto: CreateHealthFacilityDto) {
    console.log('This action adds a new Health Facility');
    createHealthFacilityDto.countryId = new mongoose.Types.ObjectId(
      createHealthFacilityDto.countryId,
    );
    createHealthFacilityDto.stateId = new mongoose.Types.ObjectId(
      createHealthFacilityDto.stateId,
    );
    createHealthFacilityDto.districtId = new mongoose.Types.ObjectId(
      createHealthFacilityDto.districtId,
    );

    createHealthFacilityDto.blockId = new mongoose.Types.ObjectId(
      createHealthFacilityDto.blockId,
    );

    const newHealthFacility = await this.HealthFacilityModel.create(
      createHealthFacilityDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.healthFacility.HEALTH_FACILITY_CREATED,
      newHealthFacility,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Health Facility');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
      { path: 'stateId', select: 'title' }, // Populate stateId and select only the name field
      { path: 'blockId', select: 'title' }, // Populate stateId and select only the name field
      { path: 'districtId', select: 'title' }, // Populate stateId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    const updatedQuery = await this.adminService.adminRoleFilter(
      userId,
      query,
      'health-facility',
    );
    return await paginate(
      this.HealthFacilityModel,
      paginationDto,
      statePopulateOptions,
      updatedQuery,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Health Facility`);
    const getHealthFacilityById = await this.HealthFacilityModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.healthFacility.HEALTH_FACILITY_LIST,
      getHealthFacilityById,
    );
  }

  async update(id: string, updateHealthFacilityDto: UpdateHealthFacilityDto) {
    console.log(`This action updates a #${id} Health Facility`);
    const updateDetails = await this.HealthFacilityModel.findByIdAndUpdate(
      id,
      updateHealthFacilityDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.healthFacility.HEALTH_FACILITY_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Health Facility`);
    const subscriber = await this.subscriberModel.findOne({
      healthFacilityId: id,
    });
    if (subscriber) {
      throw new HttpException(
        {
          message: "Can't Delete Health-Facility!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.HealthFacilityModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.healthFacility.HEALTH_FACILITY_DELETE,
      [],
    );
  }
}
