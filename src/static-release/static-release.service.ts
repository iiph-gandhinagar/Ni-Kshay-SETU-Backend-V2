import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticReleaseDto } from './dto/create-static-release.dto';
import { UpdateStaticReleaseDto } from './dto/update-static-release.dto';
import { StaticReleaseDocument } from './entities/static-release.entity';

@Injectable()
export class StaticReleaseService {
  constructor(
    @InjectModel('StaticRelease')
    private readonly staticReleaseModel: Model<StaticReleaseDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticReleaseDocument> {
    console.log('inside find by property Static Release----->');
    return this.staticReleaseModel.findOne({ [property]: value }).exec();
  }
  async create(createStaticReleaseDto: CreateStaticReleaseDto) {
    console.log('This action adds a new Release');
    const newStaticRelease = await this.staticReleaseModel.create(
      createStaticReleaseDto,
    );
    // const staticReleae = await newStaticRelease.save();
    return this.baseResponse.sendResponse(
      200,
      message.staticRelease.STATIC_RELEASE_CREATED,
      newStaticRelease,
    );
  }

  async findAll(paginationDto: PaginationDto, lang: string) {
    if (!lang) {
      lang = 'en';
    }
    console.log('This action returns all Static release');
    paginationDto.active = 'true';
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticReleaseModel, paginationDto, [], query);
  }

  async findAllReleases(paginationDto: PaginationDto, lang: string) {
    if (!lang) {
      lang = 'en';
    }
    console.log('This action returns all Static release');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticReleaseModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Static Release`);
    const getStaticReleaseById = await this.staticReleaseModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticRelease.STATIC_RELEASE_LIST,
      getStaticReleaseById,
    );
  }

  async update(id: string, updateStaticReleaseDto: UpdateStaticReleaseDto) {
    console.log(`This action updates a #${id} Static Release`);
    const updateDetails = await this.staticReleaseModel.findByIdAndUpdate(
      id,
      updateStaticReleaseDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticRelease.STATIC_RELEASE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Static Release`);
    await this.staticReleaseModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticRelease.STATIC_RELEASE_DELETE,
      [],
    );
  }
}
