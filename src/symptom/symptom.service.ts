import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';
import { SymptomDocument } from './entities/symptom.entity';

@Injectable()
export class SymptomService {
  constructor(
    @InjectModel('Symptom')
    private readonly symptomModel: Model<SymptomDocument>,
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
  ): Promise<SymptomDocument> {
    console.log('inside find by property Symptom----->');
    return this.symptomModel.findOne({ [property]: value }).exec();
  }

  async create(createSymptomDto: CreateSymptomDto) {
    console.log('This action adds a new Symptom');
    const newSymptom = await this.symptomModel.create(createSymptomDto);
    // const symptom = await newSymptom.save();
    return this.baseResponse.sendResponse(
      200,
      message.symptom.SYMPTOM_CREATED,
      newSymptom,
    );
  }

  async findSymptoms(lang: string) {
    console.log('This action returns all symptoms without Pagination');
    if (!lang) {
      lang = 'en';
    }
    let symptom;
    symptom = await this.symptomModel.find();
    symptom = await Promise.all(
      symptom.map(async (doc) => {
        const documentData = { ...doc._doc };
        // console.log('doc-->', documentData);
        const translatedFields =
          await this.languageTranslation.getSymptomTranslatedFields(
            documentData,
            lang,
          );
        return {
          ...documentData,
          ...translatedFields,
        };
      }),
    );
    return this.baseResponse.sendResponse(
      200,
      message.symptom.SYMPTOM_LIST,
      symptom,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Symptom');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.symptomModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Symptom`);
    const getSymptomById = await this.symptomModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.symptom.SYMPTOM_LIST,
      getSymptomById,
    );
  }

  async update(id: string, updateSymptomDto: UpdateSymptomDto) {
    console.log(`This action updates a #${id} Symptom`);
    const updateDetails = await this.symptomModel.findByIdAndUpdate(
      id,
      updateSymptomDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.symptom.SYMPTOM_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Symptom`);
    await this.symptomModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.symptom.SYMPTOM_DELETE,
      [],
    );
  }
}
