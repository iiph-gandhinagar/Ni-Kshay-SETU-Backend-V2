import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticAppConfigDto } from './dto/create-static-app-config.dto';
import { UpdateStaticAppConfigDto } from './dto/update-static-app-config.dto';
import { StaticAppConfigDocument } from './entities/static-app-config.entity';

@Injectable()
export class StaticAppConfigService {
  constructor(
    @InjectModel('StaticAppConfig')
    private readonly staticAppConfigModel: Model<StaticAppConfigDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticAppConfigDocument> {
    console.log('inside find by property Static Web App Config----->');
    return this.staticAppConfigModel.findOne({ [property]: value }).exec();
  }

  async create(createStaticAppConfigDto: CreateStaticAppConfigDto) {
    console.log('This action adds a new App Config');
    const newStaticAppConfig = await this.staticAppConfigModel.create(
      createStaticAppConfigDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticAppConfig.STATIC_APP_CONFIG_CREATED,
      newStaticAppConfig,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Static Web App Config');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticAppConfigModel, paginationDto, [], query);
  }

  async findAllWithoutPagination(lang: string) {
    console.log('This action returns all Static Web App Config');
    if (!lang) {
      lang = 'en';
    }
    const translation = await this.staticAppConfigModel.find();
    const appTranslations = translation.map((config) => {
      return { [config.key]: config.value[lang] };
    });
    return this.baseResponse.sendResponse(
      200,
      message.staticAppConfig.STATIC_APP_CONFIG_LIST,
      appTranslations,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Static Web App Config`);
    const getStaticAppConfigById = await this.staticAppConfigModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticAppConfig.STATIC_APP_CONFIG_LIST,
      getStaticAppConfigById,
    );
  }

  async update(id: string, updateStaticAppConfigDto: UpdateStaticAppConfigDto) {
    console.log(`This action updates a #${id} Static App Config`);
    const updateDetails = await this.staticAppConfigModel.findByIdAndUpdate(
      id,
      updateStaticAppConfigDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticAppConfig.STATIC_APP_CONFIG_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Static Web App Config`);
    await this.staticAppConfigModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticAppConfig.STATIC_APP_CONFIG_DELETE,
      [],
    );
  }
}
