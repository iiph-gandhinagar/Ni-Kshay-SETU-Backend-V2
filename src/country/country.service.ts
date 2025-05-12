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
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryDocument } from './entities/country.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectModel('Country')
    private readonly countryModel: Model<CountryDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
  ) {}

  async findByProperty(property: any, value: any) {
    console.log('inside find by property country ----->');
    return this.countryModel.findOne({ [property]: value });
  }

  async create(createCountryDto: CreateCountryDto) {
    console.log('This action adds a new country');
    const newCountry = await this.countryModel.create(createCountryDto);
    return this.baseResponse.sendResponse(
      200,
      message.country.COUNTRY_CREATED,
      newCountry,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Countries');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.countryModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} country`);
    const getCountryById = await this.countryModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.country.COUNTRY_LIST,
      getCountryById,
    );
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    console.log(`This action updates a #${id} country`);
    const updateDetails = await this.countryModel.findByIdAndUpdate(
      id,
      updateCountryDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.country.COUNTRY_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} country`);
    const subscriber = await this.subscriberModel.findOne({ countryId: id });
    if (subscriber) {
      throw new HttpException(
        {
          message: "Can't Delete Country!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.countryModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.country.COUNTRY_DELETE,
      [],
    );
  }
}
