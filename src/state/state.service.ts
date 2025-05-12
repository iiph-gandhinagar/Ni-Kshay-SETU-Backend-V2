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
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { StateDocument } from './entities/state.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
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
  ): Promise<StateDocument> {
    console.log('inside find by property state----->');
    return this.stateModel.findOne({ [property]: value }).exec();
  }
  async create(createStateDto: CreateStateDto) {
    console.log('This action adds a new state');
    createStateDto.countryId = new mongoose.Types.ObjectId(
      createStateDto.countryId,
    );
    const newState = await this.stateModel.create(createStateDto);
    // const state = await newState.save();
    return this.baseResponse.sendResponse(
      200,
      message.state.STATE_CREATE,
      newState,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all state');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    const updatedQuery = await this.adminService.adminRoleFilter(
      userId,
      query,
      'state',
    );
    return await paginate(
      this.stateModel,
      paginationDto,
      statePopulateOptions,
      updatedQuery,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} state`);
    const getStateById = await this.stateModel.findById(id).exec();
    return this.baseResponse.sendResponse(
      200,
      message.state.STATE_LIST,
      getStateById,
    );
  }

  async update(id: string, updateStateDto: UpdateStateDto) {
    console.log(`This action updates a #${id} state`);
    const existingState = await this.stateModel.findById(id);
    if (!existingState) {
      throw new HttpException(
        {
          message: 'State not found',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
      // return this.baseResponse.sendResponse(400, 'State not found', null);
    }
    const updateDetails = await this.stateModel.findByIdAndUpdate(
      id,
      updateStateDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.state.STATE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} state`);
    const subscriber = await this.subscriberModel.findOne({ stateId: id });
    if (subscriber) {
      throw new HttpException(
        {
          message: "Can't Delete State!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.stateModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(200, message.state.STATE_DELETE, []);
  }
}
