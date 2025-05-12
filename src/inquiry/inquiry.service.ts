import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { message } from 'src/common/assets/message.asset';
import { EmailService } from 'src/common/mail/email.service';
import { InquiryAggregate } from 'src/common/pagination/inquiryAggregation.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryDocument } from './entities/inquiry.entity';

@Injectable()
export class InquiryService {
  constructor(
    @InjectModel('Inquiry')
    private readonly inquiryModel: Model<InquiryDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
  ) {}
  async create(createInquiryDto: CreateInquiryDto, userId: string) {
    console.log(`This action adds a new Inquiry `);
    const userDetails = await this.subscriberModel
      .findById(userId)
      .select('name phoneNo email')
      .exec();
    if (!userDetails) {
      throw new HttpException(
        {
          message: 'User not found',
          errors: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    createInquiryDto.userId = new mongoose.Types.ObjectId(userId);
    createInquiryDto.name = userDetails.name;
    createInquiryDto.phoneNo = userDetails.phoneNo;
    const newInquiry = await this.inquiryModel.create(createInquiryDto);
    await this.emailService.sendEnquiryDetail(
      userDetails.email,
      createInquiryDto.subject,
      createInquiryDto.message,
    );
    return this.baseResponse.sendResponse(
      200,
      message.inquiry.INQUIRY_CREATED,
      newInquiry,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Inquiry');

    console.log('paginationDto', paginationDto);
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      )
      .exec();
    if (!adminUser || !adminUser.state || !adminUser.district) {
      throw new HttpException(
        'Admin User not found or state is missing or district is missing',
        HttpStatus.NOT_FOUND,
      );
    }
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);
    return await InquiryAggregate(this.inquiryModel, paginationDto, query);
  }

  async getAllInquiry(paginationDto: PaginationDto, userId: string) {
    console.log(`This action returns all inquiry`);

    const query = await this.filterService.filter(paginationDto);
    const condition = await this.adminService.adminRoleFilter(
      userId,
      {},
      'inquiry',
    );
    condition._id = { $ne: null };
    const inquiry = await this.inquiryModel.find(query).populate(
      {
        path: 'userId',
        match: condition,
        select:
          'name phoneNo email cadreId countryId stateId districtId blockId healthFacilityId',
        populate: [
          {
            path: 'cadreId',
            select: 'title',
          },
          {
            path: 'countryId',
            select: 'title',
          },
          {
            path: 'stateId',
            select: 'title',
          },
          {
            path: 'districtId',
            select: 'title',
          },
          {
            path: 'blockId',
            select: 'title',
          },
          {
            path: 'healthFacilityId',
            select: 'healthFacilityCode',
          },
        ],
      }, // Populate countryId and select only the name field
    );
    const filteredInquiry = inquiry.filter((doc) => doc.userId !== null);
    return this.baseResponse.sendResponse(
      200,
      message.inquiry.INQUIRY_LIST,
      filteredInquiry,
    );
  }
}
