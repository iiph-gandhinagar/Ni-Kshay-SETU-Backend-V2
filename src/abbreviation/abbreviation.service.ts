import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from './../common/utils/filterService';
import { CreateAbbreviationDto } from './dto/create-abbreviation.dto';
import { UpdateAbbreviationDto } from './dto/update-abbreviation.dto';
import { AbbreviationDocument } from './entities/abbreviation.entity';

@Injectable()
export class AbbreviationService {
  constructor(
    @InjectModel('Abbreviation')
    private readonly abbreviationModel: Model<AbbreviationDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}
  async findByProperty(
    property: string,
    value: string,
  ): Promise<AbbreviationDocument> {
    console.log('inside find by property Abbreviation----->');
    return this.abbreviationModel.findOne({ [property]: value }).exec();
  }
  async create(createAbbreviationDto: CreateAbbreviationDto) {
    console.log('This action adds a new Abbreviation');
    const newAbbreviation = await this.abbreviationModel.create(
      createAbbreviationDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.abbreviation.ABBREVIATION_CREATED,
      newAbbreviation,
    );
  }

  async findData() {
    console.log('This action return all Abbreviation Without pagination');
    const masterAbbreviation = await this.abbreviationModel.find().exec();
    return this.baseResponse.sendResponse(
      200,
      message.abbreviation.ABBREVIATION_LIST,
      masterAbbreviation,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Abbreviation');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.abbreviationModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Ap Config`);
    const getAbbreviationById = await this.abbreviationModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.abbreviation.ABBREVIATION_LIST,
      getAbbreviationById,
    );
  }

  async update(id: string, updateAbbreviationDto: UpdateAbbreviationDto) {
    console.log(`This action updates a #${id} Abbreviation`);
    const updateDetails = await this.abbreviationModel.findByIdAndUpdate(
      id,
      updateAbbreviationDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.abbreviation.ABBREVIATION_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Abbreviation`);
    await this.abbreviationModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.abbreviation.ABBREVIATION_DELETE,
      [],
    );
  }
}
