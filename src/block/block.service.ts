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
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { BlockDocument } from './entities/block.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel('Block')
    private readonly blockModel: Model<BlockDocument>,
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
  ): Promise<BlockDocument> {
    console.log('inside find by property block----->');
    return this.blockModel.findOne({ [property]: value }).exec();
  }
  async create(createBlockDto: CreateBlockDto) {
    console.log('This action adds a new block');
    createBlockDto.countryId = new mongoose.Types.ObjectId(
      createBlockDto.countryId,
    );
    createBlockDto.stateId = new mongoose.Types.ObjectId(
      createBlockDto.stateId,
    );
    createBlockDto.districtId = new mongoose.Types.ObjectId(
      createBlockDto.districtId,
    );
    const newBlock = await this.blockModel.create(createBlockDto);
    return this.baseResponse.sendResponse(
      200,
      message.block.BLOCK_CREATED,
      newBlock,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all block');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
      { path: 'stateId', select: 'title' }, // Populate stateId and select only the name field
      { path: 'districtId', select: 'title' }, // Populate districtId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    const updatedQuery = await this.adminService.adminRoleFilter(
      userId,
      query,
      'block',
    );
    return await paginate(
      this.blockModel,
      paginationDto,
      statePopulateOptions,
      updatedQuery,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} block`);
    const getBlockById = await this.blockModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.block.BLOCK_LIST,
      getBlockById,
    );
  }

  async update(id: string, updateBlockDto: UpdateBlockDto) {
    console.log(`This action updates a #${id} block`);
    const updateDetails = await this.blockModel.findByIdAndUpdate(
      id,
      updateBlockDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.block.BLOCK_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} block`);
    const subscriber = await this.subscriberModel.findOne({ blockId: id });
    if (subscriber) {
      throw new HttpException(
        {
          message: "Can't Delete Block!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.blockModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(200, message.block.BLOCK_DELETE, []);
  }
}
