import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateAutomaticNotificationDto } from './dto/create-automatic-notification.dto';
import { AutomaticNotificationDocument } from './entities/automatic-notification.entity';

@Injectable()
export class AutomaticNotificationService {
  constructor(
    @InjectModel('AutomaticNotification')
    private readonly automaticNotificationModel: Model<AutomaticNotificationDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}
  async create(createAutomaticNotificationDto: CreateAutomaticNotificationDto) {
    console.log('This action adds a new AutoMatic notification');
    createAutomaticNotificationDto.createdBy = new mongoose.Types.ObjectId(
      createAutomaticNotificationDto.createdBy,
    );
    createAutomaticNotificationDto.userId =
      createAutomaticNotificationDto.userId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    const newAutomaticNotification = new this.automaticNotificationModel(
      createAutomaticNotificationDto,
    );
    const notification = await newAutomaticNotification.save();
    return this.baseResponse.sendResponse(
      200,
      'Automatic Notification store Successfully',
      notification,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all AutoMatic notification');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'userId', select: 'name email phoneNo' }, // Populate countryId and select only the name field
      { path: 'createdBy', select: 'firstName lastName' }, // Populate countryId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.automaticNotificationModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async getUserNotification(paginationDto: PaginationDto, userId: string) {
    console.log(`This action returns Notification List`);
    const queries: any = {};
    queries.$and = [
      {
        userId: { $in: [new mongoose.Types.ObjectId(userId)] },
      },
    ];
    return await paginate(
      this.automaticNotificationModel,
      paginationDto,
      [],
      queries,
    );
  }
}
