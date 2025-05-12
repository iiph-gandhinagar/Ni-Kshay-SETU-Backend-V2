import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticEnquiryDto } from './dto/create-static-enquiry.dto';
import { StaticEnquiryDocument } from './entities/static-enquiry.entity';

@Injectable()
export class StaticEnquiryService {
  constructor(
    @InjectModel('StaticEnquiry')
    private readonly staticEnquiryModel: Model<StaticEnquiryDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticEnquiryDocument> {
    console.log('inside find by property Enquiry----->');
    return this.staticEnquiryModel.findOne({ [property]: value }).exec();
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Enquiry');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticEnquiryModel, paginationDto, [], query);
  }

  async inquiryCsv(paginationDto: PaginationDto) {
    console.log('This action returns all Enquiry csv');
    const { sortBy, sortOrder } = paginationDto;
    const query = await this.filterService.filter(paginationDto);
    const result = await this.staticEnquiryModel
      .find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      'Enquiry Fetch successfully!!',
      result,
    );
  }

  async create(createStaticEnquiryDto: CreateStaticEnquiryDto) {
    const newStaticEnquiry = await this.staticEnquiryModel.create(
      createStaticEnquiryDto,
    );
    const { email, subject, message } = createStaticEnquiryDto;
    await this.emailService.sendEnquiryDetail(email, subject, message);
    return this.baseResponse.sendResponse(
      200,
      'Enquiry store successfully!!',
      newStaticEnquiry,
    );
  }
}
