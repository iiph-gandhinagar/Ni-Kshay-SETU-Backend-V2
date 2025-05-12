import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticModuleDto } from './dto/create-static-module.dto';
import { UpdateStaticModuleDto } from './dto/update-static-module.dto';
import { StaticModuleDocument } from './entities/static-module.entity';

@Injectable()
export class StaticModuleService {
  constructor(
    @InjectModel('StaticModule')
    private readonly staticModuleModel: Model<StaticModuleDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticModuleDocument> {
    console.log('inside find by property Static Module----->');
    return this.staticModuleModel.findOne({ [property]: value }).exec();
  }

  async create(createStaticModuleDto: CreateStaticModuleDto) {
    console.log('This action adds a new Module');
    createStaticModuleDto.slug = createStaticModuleDto.title['en']
      .trim() // Remove leading and trailing spaces
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, '');
    const newStaticModule = await this.staticModuleModel.create(
      createStaticModuleDto,
    );

    return this.baseResponse.sendResponse(
      200,
      message.staticModule.STATIC_MODULE_CREATED,
      newStaticModule,
    );
  }

  async findAll(paginationDto: PaginationDto, lang: string) {
    if (!lang) {
      lang = 'en';
    }
    console.log('This action returns all Static Module');
    paginationDto.active = 'true';
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticModuleModel, paginationDto, [], query);
  }

  async getStaticModuleBySlug(slug: string, lang: string) {
    if (!lang) {
      lang = 'en';
    }
    const staticModule = await this.staticModuleModel.findOne({
      slug: new RegExp(slug, 'i'),
    });
    if (!staticModule) {
      throw new HttpException(
        {
          message: 'Module Not Found!',
          errors: 'bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.baseResponse.sendResponse(
      200,
      message.staticModule.STATIC_MODULE_LIST,
      staticModule,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Static Module`);
    const getStaticModuleById = await this.staticModuleModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticModule.STATIC_MODULE_LIST,
      getStaticModuleById,
    );
  }

  async update(id: string, updateStaticModuleDto: UpdateStaticModuleDto) {
    console.log(`This action updates a #${id} Static Module`);
    if (updateStaticModuleDto.title) {
      updateStaticModuleDto.slug = updateStaticModuleDto.title['en']
        .trim() // Remove leading and trailing spaces
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w-]+/g, '');
    }
    const updateDetails = await this.staticModuleModel.findByIdAndUpdate(
      id,
      updateStaticModuleDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticModule.STATIC_MODULE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Static Web Module`);
    await this.staticModuleModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticModule.STATIC_MODULE_DELETE,
      [],
    );
  }
}
