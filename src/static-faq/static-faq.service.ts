import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticFaqDto } from './dto/create-static-faq.dto';
import { UpdateStaticFaqDto } from './dto/update-static-faq.dto';
import { StaticFaqDocument } from './entities/static-faq.entity';

@Injectable()
export class StaticFaqService {
  constructor(
    @InjectModel('StaticFaq')
    private readonly staticFaqModel: Model<StaticFaqDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticFaqDocument> {
    console.log('inside find by property FAQ----->');
    return this.staticFaqModel.findOne({ [property]: value }).exec();
  }

  async create(createStaticFaqDto: CreateStaticFaqDto) {
    console.log('This action adds a new FAQ');
    const newStaticFaq = await this.staticFaqModel.create(createStaticFaqDto);
    //  const staticFaq = await newStaticFaq.save();
    return this.baseResponse.sendResponse(
      200,
      message.staticFaq.STATIC_FAQ_CREATED,
      newStaticFaq,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all FAQ');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticFaqModel, paginationDto, [], query);
  }

  async findAllWithoutPagination(lang: string) {
    if (!lang) {
      lang = 'en';
    }
    console.log('This action returns all FAQ');
    const getFaqById = await this.staticFaqModel
      .find({ active: true })
      .sort({ orderIndex: 1 })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.staticFaq.STATIC_FAQ_LIST,
      getFaqById,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} FAQ`);
    const getFaqById = await this.staticFaqModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticFaq.STATIC_FAQ_LIST,
      getFaqById,
    );
  }

  async update(id: string, updateStaticFaqDto: UpdateStaticFaqDto) {
    console.log(`This action updates a #${id} FAQ`);
    const updateDetails = await this.staticFaqModel.findByIdAndUpdate(
      id,
      updateStaticFaqDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticFaq.STATIC_FAQ_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} FAQ`);
    await this.staticFaqModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticFaq.STATIC_FAQ_DELETE,
      [],
    );
  }
}
