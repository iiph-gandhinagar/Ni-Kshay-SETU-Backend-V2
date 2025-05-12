import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateFlashSimilarAppDto } from './dto/create-flash-similar-app.dto';
import { UpdateFlashSimilarAppDto } from './dto/update-flash-similar-app.dto';
import { FlashSimilarAppDocument } from './entities/flash-similar-app.entity';

@Injectable()
export class FlashSimilarAppsService {
  constructor(
    @InjectModel('FlashSimilarApp')
    private readonly flashSimilarAppModel: Model<FlashSimilarAppDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<FlashSimilarAppDocument> {
    console.log('inside find by property Flash Similar Apps----->');
    return this.flashSimilarAppModel.findOne({ [property]: value }).exec();
  }
  async create(createFlashSimilarAppDto: CreateFlashSimilarAppDto) {
    console.log('This action adds a new Flash Similar Apps');
    const newFlashSimilarApps = await this.flashSimilarAppModel.create(
      createFlashSimilarAppDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.flashSimilarApp.FLASH_SIMILAR_APP_CREATED,
      newFlashSimilarApps,
    );
  }

  async findActiveSimilarApps() {
    console.log('This action returns all Flash Similar Apps');
    const getFlashSimilarApps = await this.flashSimilarAppModel.find({
      active: true,
    });
    return this.baseResponse.sendResponse(
      200,
      message.flashSimilarApp.FLASH_SIMILAR_APP_LIST,
      getFlashSimilarApps,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Flash Similar Apps');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.flashSimilarAppModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Flash Similar Apps`);
    const getFlashSimilarAppById = await this.flashSimilarAppModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.flashSimilarApp.FLASH_SIMILAR_APP_LIST,
      getFlashSimilarAppById,
    );
  }

  async update(id: string, updateFlashSimilarAppDto: UpdateFlashSimilarAppDto) {
    console.log(`This action updates a #${id} Flash Similar Apps`);
    const updateDetails = await this.flashSimilarAppModel.findByIdAndUpdate(
      id,
      updateFlashSimilarAppDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.flashSimilarApp.FLASH_SIMILAR_APP_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Flash Similar Apps`);
    await this.flashSimilarAppModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.flashSimilarApp.FLASH_SIMILAR_APP_DELETE,
      [],
    );
  }
}
