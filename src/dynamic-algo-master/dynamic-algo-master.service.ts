import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { CreateDynamicAlgoMasterDto } from './dto/create-dynamic-algo-master.dto';
import { UpdateDynamicAlgoMasterDto } from './dto/update-dynamic-algo-master.dto';
import { DynamicAlgoMasterDocument } from './entities/dynamic-algo-master.entity';

@Injectable()
export class DynamicAlgoMasterService {
  constructor(
    @InjectModel('DynamicAlgoMaster')
    private readonly dynamicAlgoModel: Model<DynamicAlgoMasterDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => LanguageTranslation))
    private readonly languageTranslation: LanguageTranslation,
  ) {}
  async findByProperty(
    property: string,
    value: string,
  ): Promise<DynamicAlgoMasterDocument> {
    console.log('inside find by property Dynamic Algo Master----->');
    return this.dynamicAlgoModel.findOne({ [property]: value }).exec();
  }
  async create(createDynamicAlgoMasterDto: CreateDynamicAlgoMasterDto) {
    console.log('This action adds a new Dynamic Algo Master');
    const newDynamicAlgo = await this.dynamicAlgoModel.create(
      createDynamicAlgoMasterDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgoMaster.DYNAMIC_ALGO_MASTER_CREATED,
      newDynamicAlgo,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Dynamic Algo Master');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.dynamicAlgoModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Dynamic Algo Master`);
    const getDynamicAlgoMasterById = await this.dynamicAlgoModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgoMaster.DYNAMIC_ALGO_MASTER_LIST,
      getDynamicAlgoMasterById,
    );
  }

  async update(
    id: string,
    updateDynamicAlgoMasterDto: UpdateDynamicAlgoMasterDto,
  ) {
    console.log(`This action updates a #${id} Dynamic Algo Master`);
    const updateDetails = await this.dynamicAlgoModel.findByIdAndUpdate(
      id,
      updateDynamicAlgoMasterDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgoMaster.DYNAMIC_ALGO_MASTER_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Dynamic Algo Master`);
    await this.dynamicAlgoModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgoMaster.DYNAMIC_ALGO_MASTER_DELETE,
      [],
    );
  }

  async dynamicParent(lang: string) {
    if (!lang) {
      lang = 'en';
    }
    console.log('This action return master node of dynamic algo');
    let getDynamicAlgoMasterById = await this.dynamicAlgoModel
      .find({ active: true })
      .lean()
      .exec();
    getDynamicAlgoMasterById = await Promise.all(
      getDynamicAlgoMasterById.map(async (doc) => {
        // const docObj = doc.toObject();
        const translatedFields =
          await this.languageTranslation.getSymptomTranslatedFields(doc, lang);
        return {
          ...doc,
          ...translatedFields,
        };
      }),
    );
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgoMaster.DYNAMIC_ALGO_MASTER_LIST,
      getDynamicAlgoMasterById,
    );
  }
}
