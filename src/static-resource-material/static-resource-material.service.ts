import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticResourceMaterialDto } from './dto/create-static-resource-material.dto';
import { UpdateStaticResourceMaterialDto } from './dto/update-static-resource-material.dto';
import { StaticResourceMaterialDocument } from './entities/static-resource-material.entity';

@Injectable()
export class StaticResourceMaterialService {
  constructor(
    @InjectModel('StaticResourceMaterial')
    private readonly staticResourceMaterialModel: Model<StaticResourceMaterialDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticResourceMaterialDocument> {
    console.log('inside find by property Static Resource Material----->');
    return this.staticResourceMaterialModel
      .findOne({ [property]: value })
      .exec();
  }
  async create(
    createStaticResourceMaterialDto: CreateStaticResourceMaterialDto,
  ) {
    console.log('This action adds a new Resource Material');
    const newStaticResourceMaterial =
      await this.staticResourceMaterialModel.create(
        createStaticResourceMaterialDto,
      );
    return this.baseResponse.sendResponse(
      200,
      message.staticResourceMaterial.STATIC_RESOURCE_MATERIAL_CREATED,
      newStaticResourceMaterial,
    );
  }

  async findAll(paginationDto: PaginationDto, lang: string) {
    console.log('This action returns all Static Resource Material');
    if (!lang) {
      lang = 'en';
    }
    paginationDto.active = 'true';
    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.staticResourceMaterialModel,
      paginationDto,
      [],
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Static Resource Material`);
    const getStaticResourceMaterialById =
      await this.staticResourceMaterialModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticResourceMaterial.STATIC_RESOURCE_MATERIAL_LIST,
      getStaticResourceMaterialById,
    );
  }

  async update(
    id: string,
    updateStaticResourceMaterialDto: UpdateStaticResourceMaterialDto,
  ) {
    console.log(`This action updates a #${id} Static Resource Material`);
    const updateDetails =
      await this.staticResourceMaterialModel.findByIdAndUpdate(
        id,
        updateStaticResourceMaterialDto,
        { new: true },
      );
    return this.baseResponse.sendResponse(
      200,
      message.staticResourceMaterial.STATIC_RESOURCE_MATERIAL_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Static Web Resource Material`);
    await this.staticResourceMaterialModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticResourceMaterial.STATIC_RESOURCE_MATERIAL_DELETE,
      [],
    );
  }
}
