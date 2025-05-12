import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticWhatWeDoDto } from './dto/create-static-what-we-do.dto';
import { UpdateStaticWhatWeDoDto } from './dto/update-static-what-we-do.dto';
import { StaticWhatWeDoDocument } from './entities/static-what-we-do.entity';

@Injectable()
export class StaticWhatWeDoService {
  constructor(
    @InjectModel('StaticWhatWeDo')
    private readonly staticWhatWeDoModel: Model<StaticWhatWeDoDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}
  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticWhatWeDoDocument> {
    console.log('inside find by property Static What We Do----->');
    return this.staticWhatWeDoModel.findOne({ [property]: value }).exec();
  }

  async create(createStaticWhatWeDoDto: CreateStaticWhatWeDoDto) {
    console.log('This action adds a new What We Do');
    const newStaticWhatWeDo = await this.staticWhatWeDoModel.create(
      createStaticWhatWeDoDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticWhatWeDo.STATIC_WHAT_WE_DO_CREATED,
      newStaticWhatWeDo,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Static What We Do');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticWhatWeDoModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Static What We Do`);
    const getStaticWhatWeDoById = await this.staticWhatWeDoModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticWhatWeDo.STATIC_WHAT_WE_DO_LIST,
      getStaticWhatWeDoById,
    );
  }

  async update(id: string, updateStaticWhatWeDoDto: UpdateStaticWhatWeDoDto) {
    console.log(`This action updates a #${id} Static What We Do`);
    const updateDetails = await this.staticWhatWeDoModel.findByIdAndUpdate(
      id,
      updateStaticWhatWeDoDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticWhatWeDo.STATIC_WHAT_WE_DO_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Static What We Do`);
    await this.staticWhatWeDoModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticWhatWeDo.STATIC_WHAT_WE_DO_DELETE,
      [],
    );
  }
}
