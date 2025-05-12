import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { stringify } from 'csv-stringify';
import * as dotenv from 'dotenv';
import moment from 'moment';
import mongoose, { Model } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { BlockDocument } from 'src/block/entities/block.entity';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { SubscriberAggregation } from 'src/common/pagination/subscriberAggregation.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CountryDocument } from 'src/country/entities/country.entity';
import { DistrictDocument } from 'src/district/entities/district.entity';
import { HealthFacilityDocument } from 'src/health-facility/entities/health-facility.entity';
import { InstituteDocument } from 'src/institute/entities/institute.entity';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressService } from 'src/subscriber-progress/subscriber-progress.service';
import { CreateSubscriberV2Dto } from './dto/create-subscriber-v2.dto';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { LoginDTO } from './dto/login.dto';
import { OtpGenerationDto } from './dto/otp-generation.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ValidationPhoneNoDto } from './dto/validate-phoneno.dto';
import { SubscriberDocument } from './entities/subscriber.entity';
dotenv.config();

@Injectable()
export class SubscriberService {
  private readonly apiKey = process.env.TEXTLOCAL_API_KEY; // Your Textlocal API key
  private readonly webhookUrl = process.env.SLACK_WEBHOOK_URL;
  private readonly apiUrl = 'https://api.textlocal.in/send/?';
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @InjectModel('Country')
    private readonly countryModel: Model<CountryDocument>,
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
    @InjectModel('District')
    private readonly districtModel: Model<DistrictDocument>,
    @InjectModel('Block')
    private readonly blockModel: Model<BlockDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('HealthFacility')
    private readonly healthFacilityModel: Model<HealthFacilityDocument>,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @InjectModel('Institute')
    private readonly instituteModel: Model<InstituteDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => SubscriberProgressService))
    private readonly SubscriberProgressServices: SubscriberProgressService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<SubscriberDocument> {
    console.log('inside find by property Subscriber----->');
    return this.subscriberModel.findOne({ [property]: value }).exec();
  }

  async verifyAccessToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      console.log('payload--->', payload);
      return payload;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken, userId } = refreshTokenDto;
      console.log('userId-->', userId);
      try {
        await this.verifyAccessToken(refreshToken);
      } catch (err) {
        if (err instanceof UnauthorizedException) {
          // If access token expired, move on to verify refresh token
          console.log('Access token expired, moving to refresh token logic...');
        } else {
          // Other errors related to the access token
          throw new UnauthorizedException('Invalid access token');
        }
      }

      const userIds = await this.subscriberModel.findById(userId);
      if (!userIds) {
        throw new UnauthorizedException('User not found');
      }
      const payloads = {
        _id: userIds._id,
        phoneNo: userIds.phoneNo,
        sub: userIds._id,
        role: 'subscriber',
      };
      const accessToken = await this.jwtService.signAsync(payloads, {
        expiresIn: '365d',
        secret: process.env.JWT_SECRET,
      });
      payloads['type'] = 'refresh';
      const newRefreshToken = await this.jwtService.signAsync(payloads, {
        expiresIn: '365d',
        secret: process.env.JWT_SECRET,
      });
      return this.baseResponse.sendResponse(200, 'Refresh Token', [
        accessToken,
        newRefreshToken,
      ]);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  async create(createSubscriberDto: CreateSubscriberDto) {
    console.log('This action adds a new Subscriber');
    createSubscriberDto.userContext = {
      chatHotQuestionOffset: 0,
      weeklyAssessmentCount: 0,
      feedbackHistory: [],
      queryDetails: {},
    };
    createSubscriberDto.status = 'Unverified';
    const newSubscriber =
      await this.subscriberModel.create(createSubscriberDto);
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_CREATED,
      newSubscriber,
    );
  }

  async createV2(createSubscriberDto: CreateSubscriberV2Dto) {
    console.log('This action adds a new Subscriber v2');
    if (createSubscriberDto.countryId) {
      createSubscriberDto.countryId = new mongoose.Types.ObjectId(
        createSubscriberDto.countryId,
      );
    }
    if (createSubscriberDto.cadreId) {
      createSubscriberDto.cadreId = new mongoose.Types.ObjectId(
        createSubscriberDto.cadreId,
      );
    }
    if (createSubscriberDto.stateId) {
      createSubscriberDto.stateId = new mongoose.Types.ObjectId(
        createSubscriberDto.stateId,
      );
    }
    if (createSubscriberDto.districtId) {
      createSubscriberDto.districtId = new mongoose.Types.ObjectId(
        createSubscriberDto.districtId,
      );
    }
    if (createSubscriberDto.blockId) {
      createSubscriberDto.blockId = new mongoose.Types.ObjectId(
        createSubscriberDto.blockId,
      );
    }
    if (createSubscriberDto.healthFacilityId) {
      createSubscriberDto.healthFacilityId = new mongoose.Types.ObjectId(
        createSubscriberDto.healthFacilityId,
      );
    }
    createSubscriberDto.userContext = {
      chatHotQuestionOffset: 0,
      weeklyAssessmentCount: 0,
      feedbackHistory: [],
      queryDetails: {},
    };
    createSubscriberDto.status = 'Unverified';
    console.log('country code v2--->', createSubscriberDto.countryCode);
    const newSubscriber =
      await this.subscriberModel.create(createSubscriberDto);
    // const result = await newSubscriber.save();
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_CREATED,
      newSubscriber,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Subscriber');

    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      )
      .exec();
    if (!adminUser) {
      throw new HttpException('Admin User not found', HttpStatus.NOT_FOUND);
    }
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);

    return await SubscriberAggregation(
      this.subscriberModel,
      paginationDto,
      query,
    );
  }

  async subscriberReport(paginationDto: PaginationDto, userId: string) {
    console.log('inside subscriber report--->');
    const { page, limit, sortBy, sortOrder, primaryCadres } = paginationDto;
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);
    let subscribers;
    if (primaryCadres) {
      const cadreIds = await this.cadreModel
        .find({
          cadreGroup: {
            $in: primaryCadres.map((t) => new mongoose.Types.ObjectId(t)),
          },
        })
        .distinct('_id');
      if (query.cadreId) {
        // If query.cadreId already exists, combine the filters
        if (query.cadreId.$in) {
          query.cadreId.$in = [...new Set([...query.cadreId.$in, ...cadreIds])];
        } else {
          query.cadreId = { $in: [...new Set([query.cadreId, ...cadreIds])] };
        }
      } else {
        // If no existing cadreId filter, apply the new one
        query.cadreId = { $in: cadreIds };
      }
      subscribers = await this.subscriberModel
        .find(query)
        .skip(Number(limit) * (Number(page) - 1))
        .limit(Number(limit))
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .select(
          'name phoneNo isVerified email status isOldUser countryId stateId districtId blockId healthFacilityId cadreId cadreType createdAt updatedAt',
        );
    } else {
      subscribers = await this.subscriberModel
        .find(query)
        .skip(Number(limit) * (Number(page) - 1))
        .limit(Number(limit))
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .select(
          'name phoneNo email isVerified status isOldUser countryId stateId districtId blockId healthFacilityId cadreId cadreType createdAt updatedAt',
        );
    }

    const countryIds = [
      ...new Set(subscribers.map((s) => s.countryId).filter(Boolean)),
    ];
    const stateIds = [
      ...new Set(subscribers.map((s) => s.stateId).filter(Boolean)),
    ];
    const districtIds = [
      ...new Set(subscribers.map((s) => s.districtId).filter(Boolean)),
    ];
    const blockIds = [
      ...new Set(subscribers.map((s) => s.blockId).filter(Boolean)),
    ];
    const healthFacilityIds = [
      ...new Set(subscribers.map((s) => s.healthFacilityId).filter(Boolean)),
    ];
    const cadreIds = [
      ...new Set(subscribers.map((s) => s.cadreId).filter(Boolean)),
    ];

    // Fetch all related data in parallel
    const [countries, states, districts, blocks, healthFacilities, cadres] =
      await Promise.all([
        countryIds.length
          ? this.countryModel.find({ _id: { $in: countryIds } })
          : [],
        stateIds.length ? this.stateModel.find({ _id: { $in: stateIds } }) : [],
        districtIds.length
          ? this.districtModel.find({ _id: { $in: districtIds } })
          : [],
        blockIds.length ? this.blockModel.find({ _id: { $in: blockIds } }) : [],
        healthFacilityIds.length
          ? this.healthFacilityModel.find({ _id: { $in: healthFacilityIds } })
          : [],
        cadreIds.length
          ? await this.cadreModel
              .find({ _id: { $in: cadreIds } })
              .populate('cadreGroup', 'title') // Ensure cadreGroup is populated
          : [],
      ]);

    // Convert lookup arrays to maps for quick access
    const countryMap = new Map<string, string>(
      countries.map((c) => [c._id.toString(), c.title] as [string, string]),
    );

    const stateMap = new Map<string, string>(
      states.map((s) => [s._id.toString(), s.title] as [string, string]),
    );
    console.log('stateId --->', stateMap);
    const districtMap = new Map<string, string>(
      districts.map((d) => [d._id.toString(), d.title] as [string, string]),
    );

    const blockMap = new Map<string, string>(
      blocks.map((b) => [b._id.toString(), b.title] as [string, string]),
    );

    const healthFacilityMap = new Map<string, string>(
      healthFacilities.map(
        (h) => [h._id.toString(), h.healthFacilityCode] as [string, string],
      ),
    );

    const cadreMap = new Map<
      string,
      {
        title: string;
        cadreGroup: string;
        cadreGroupTitle: string;
        cadreType: string;
      }
    >(
      cadres.map(
        (c) =>
          [
            c._id.toString(),
            {
              title: c.title,
              cadreGroup: c.cadreGroup?._id?.toString() || '', // Ensure cadreGroup is stored properly
              cadreGroupTitle: (c.cadreGroup as any)?.title || '', // Access `title` after population
              cadreType: c.cadreType,
            },
          ] as [
            string,
            {
              title: string;
              cadreGroup: string;
              cadreGroupTitle: string;
              cadreType: string;
            },
          ],
      ),
    );

    const enrichedSubscribers = subscribers.map((subscriber) => ({
      ...subscriber.toObject(),
      country: countryMap.get(subscriber.countryId?.toString()) || '',
      state: stateMap.get(subscriber.stateId?.toString()) || '',
      district: districtMap.get(subscriber.districtId?.toString()) || '',
      block: blockMap.get(subscriber.blockId?.toString()) || '',
      healthFacility:
        healthFacilityMap.get(subscriber.healthFacilityId?.toString()) || '',
      cadre: cadreMap.get(subscriber.cadreId?.toString())?.title || '',
      cadreGroup:
        cadreMap.get(subscriber.cadreId?.toString())?.cadreGroupTitle || '',
      cadreType: cadreMap.get(subscriber.cadreId?.toString())?.cadreType || '',
    }));

    // Get total count separately
    const totalItems = await this.subscriberModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    return {
      status: true,
      message: 'Data retrieved successfully',
      data: {
        list: enrichedSubscribers,
        totalItems,
        currentPage: Number(page),
        totalPages,
      },
      code: 200,
    };
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Subscriber`);
    const getSubscriberById = await this.subscriberModel.findById(id).exec();
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_LIST,
      getSubscriberById,
    );
  }

  async update(id: string, updateSubscriberDto: UpdateSubscriberDto) {
    console.log(`This action updates a #${id} Subscriber`);
    if (updateSubscriberDto.stateId) {
      updateSubscriberDto.stateId = new mongoose.Types.ObjectId(
        updateSubscriberDto.stateId,
      );
    }

    if (updateSubscriberDto.districtId) {
      updateSubscriberDto.districtId = new mongoose.Types.ObjectId(
        updateSubscriberDto.districtId,
      );
    }

    if (updateSubscriberDto.blockId) {
      updateSubscriberDto.blockId = new mongoose.Types.ObjectId(
        updateSubscriberDto.blockId,
      );
    }

    if (updateSubscriberDto.healthFacilityId) {
      updateSubscriberDto.healthFacilityId = new mongoose.Types.ObjectId(
        updateSubscriberDto.healthFacilityId,
      );
    }
    if (updateSubscriberDto.countryId) {
      updateSubscriberDto.countryId = new mongoose.Types.ObjectId(
        updateSubscriberDto.countryId,
      );
    }
    updateSubscriberDto.status = 'Verified';
    const updateDetails = await this.subscriberModel
      .findByIdAndUpdate(id, updateSubscriberDto, { new: true })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Subscriber`);
    await this.subscriberModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_DELETE,
      [],
    );
  }

  async sendForgotOtp() {
    /* Scheduler function for sending OTP */
    console.log(
      `This Action sends an OTP to all subscriber who are unable to login`,
    );
    const timeMinus10Minutes = new Date(new Date().getTime() - 10 * 60 * 1000);
    const users = await this.subscriberModel
      .find({ isVerified: false, createdAt: timeMinus10Minutes })
      .select('phoneNo email name');
    for (const item of users) {
      const payload = {
        phoneNo: item.phoneNo,
        email: item.email,
      };
      await this.otpGeneration(payload);
      await this.subscriberModel
        .findOneAndUpdate(
          { phoneNo: item.phoneNo },
          { forgotOtpTime: new Date() },
        )
        .exec();
    }
    return true;
  }

  async sendOtpManually(id: string) {
    /* Send OTP Manually */
    console.log('This action returns OTP to user Manually');
    const user = await this.subscriberModel
      .findById(id)
      .select('phoneNo email name');

    if (!user) {
      throw new Error('User not found'); // Throw an error if user is not found
    }

    if (!user.phoneNo || !user.email) {
      return this.baseResponse.sendResponse(
        400,
        'Phone number or email missing',
        [],
      );
    }
    const payload = {
      phoneNo: user.phoneNo,
      email: user.email,
    };
    await this.otpGeneration(payload);
    await this.subscriberModel
      .findOneAndUpdate({ _id: id }, { forgotOtpTime: new Date() })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_OTP_SEND,
      [],
    );
  }

  async otpGeneration(
    otpGenerationDto: OtpGenerationDto,
    ip?: any,
    userAgent?: any,
  ) {
    const { phoneNo, email } = otpGenerationDto;
    console.log('user ip--->', ip);
    if (
      ip === '49.34.230.80' ||
      ip === '49.34.235.61' ||
      ip === '49.34.118.132' ||
      ip === '49.34.236.87' ||
      ip === '49.34.123.189' ||
      (phoneNo &&
        (phoneNo === '9426426287' ||
          phoneNo === '9712788799' ||
          phoneNo === '8160828272')) ||
      (email && email === 'tumansa01@gmail.com')
    ) {
      return this.baseResponse.sendResponse(
        200,
        message.subscriber.SUBSCRIBER_OTP_SEND,
        [],
      );
    }
    const user = await this.subscriberModel
      .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      .select('name countryCode');
    const expiredDate = moment().add(8, 'm');
    const OTP = Math.floor(1000 + Math.random() * 9000);
    const messageText = `Thank you for signing up with Ni-kshay Setu. ${OTP} is your OTP for registration. OTP is valid for 8 minutes. Do not share this OTP with anyone. - IIPHG`;
    if (phoneNo && phoneNo == '1231231231') {
      await this.subscriberModel
        .findOneAndUpdate(
          { phoneNo: phoneNo },
          { otp: '1111', expiredDate: expiredDate },
        )
        .exec();
    } else if (phoneNo) {
      const userCountryCode = await this.subscriberModel
        .findOne({ phoneNo })
        .select('name countryCode email');
      if (!userCountryCode) {
        throw new UnauthorizedException('User not found');
      }
      if (userCountryCode.countryCode == '+91') {
        const payload = new URLSearchParams({
          apikey: this.apiKey,
          numbers: '91' + phoneNo,
          message: messageText,
          sender: 'IIPHGN', // Your sender ID (optional)
        }).toString();

        // console.log('payload ---->', payload);
        try {
          await axios.post(this.apiUrl, payload, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(payload),
            },
          });
          console.log('after post api -->');
          await this.subscriberModel
            .findOneAndUpdate(
              { phoneNo: phoneNo },
              { otp: OTP, expiredDate: expiredDate },
            )
            .exec();
        } catch (error) {
          console.error(
            '❌ Error sending SMS:',
            error.response ? error.response.data : error.message,
          );
          return this.baseResponse.sendError(
            400,
            error.response ? error.response.data : error.message,
            [],
          );
        }
      } else {
        await this.subscriberModel
          .findOneAndUpdate(
            {
              email: { $regex: new RegExp(`^${userCountryCode?.email}$`, 'i') },
            },
            { otp: OTP, expiredDate: expiredDate },
          )
          .exec();
        await this.emailService.sendOTP(
          userCountryCode?.email,
          userCountryCode?.name,
          OTP,
        );
      }
    } else {
      console.log('send email ---->');
      console.log('email', email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      await this.emailService.sendOTP(email, user?.name, OTP);
      await this.subscriberModel
        .findOneAndUpdate(
          { email: { $regex: new RegExp(`^${email}$`, 'i') } },
          { otp: OTP, expiredDate: expiredDate },
        )
        .exec();
    }
    try {
      await axios.post(this.webhookUrl, {
        text: phoneNo
          ? `${messageText}-PhoneNo-******${phoneNo.slice(-4)}`
          : messageText + '-Email-' + email,
      });
      // await this.emailSendLogic(OTP);
    } catch (error) {
      console.error('❌ Error sending message to Slack', error);
    }
    if (ip) {
      const userDetails = await this.subscriberModel
        .findOne({ phoneNo })
        .select('name countryCode');
      const payload = {
        userId: user ? user._id : userDetails._id,
        userName: user ? user.name : userDetails.name,
        phoneNo: phoneNo ? phoneNo : '',
        email: email ? email : '',
        ip: ip,
      };
      await this.subscriberActivityModel.create({
        module: 'Generate OTP',
        action: 'Generate OTP',
        ipAddress: ip,
        userId: user ? user._id : userDetails._id,
        payload: payload,
        platform: userAgent,
      });
    }

    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_OTP_SEND,
      [],
    );
  }

  async emailSendLogic(OTP: number) {
    const email = [
      {
        emailId: 'jpatel@iiphg.org',
        name: 'Dr. Jay',
      },
      {
        emailId: 'srai@iiphg.org',
        name: 'Dr. Sandeep ',
      },
      {
        emailId: 'asen@iiphg.org',
        name: 'Dr. Abhishek',
      },
      {
        emailId: 'mehulp@digiflux.io',
        name: 'Mehul (Digiflux)',
      },
    ];
    for (const item of email)
      await this.emailService.sendOTP(item.emailId, item.name, OTP);
  }

  async login(loginDto: LoginDTO) {
    const { phoneNo, otp, email } = loginDto;
    let userExist;
    if (phoneNo) {
      userExist = await this.subscriberModel
        .findOne({ phoneNo: phoneNo })
        .lean(true);
    } else {
      userExist = await this.subscriberModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') },
      });
    }
    if (!userExist) {
      throw new HttpException(
        {
          message:
            'Invalid contact number or Email!! PLease Register and OTP is send to your phone No. or email',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (otp) {
      this.verifyOtp(loginDto);
    } else {
      return this.baseResponse.sendError(400, 'Please Enter OTP!!', []);
    }

    const payload = {
      _id: userExist._id,
      phoneNo: userExist.phoneNo,
      sub: userExist._id,

      role: 'subscriber',
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '365d',
      secret: process.env.JWT_SECRET,
    });
    payload['type'] = 'refresh';
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '365d',
      secret: process.env.JWT_SECRET,
    });

    return {
      status: true,
      message: 'Login Successful!!',
      data: [
        {
          access_token: accessToken,
          refreshToken: refreshToken,
          id: userExist._id,
          phoneNo: userExist.phoneNo,
          name: userExist.name,
          email: userExist.email,
        },
      ],
      code: 200,
    };
  }

  async validatePhoneNo(validationPhoneNoDto: ValidationPhoneNoDto) {
    const { phoneNo, email } = validationPhoneNoDto;
    let userExist;
    if (phoneNo) {
      userExist = await this.subscriberModel
        .findOne({ phoneNo: phoneNo })
        .lean(true);
    } else {
      userExist = await this.subscriberModel
        .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        .lean(true);
    }

    if (!userExist) {
      return this.baseResponse.sendError(
        400,
        'Invalid contact number or Email!!',
        { isNewUser: true },
      );
    } else {
      return this.baseResponse.sendError(
        200,
        'Email or PhoneNo. does not Exist!!',
        [],
      );
    }
  }

  async verifyOtp(loginDto: LoginDTO) {
    const { email, phoneNo, otp } = loginDto;
    let userExist, emailExist;
    if (phoneNo && phoneNo == '1231231231') {
      userExist = await this.subscriberModel.findOne({ phoneNo }).lean(true);
      const payload = {
        _id: userExist._id,
        phoneNo: userExist.phoneNo,
        role: 'subscriber',
      };
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '365d',
        secret: process.env.JWT_SECRET,
      });
      const result = {
        isEmailExist: true,
        isOldUser: false,
        id: userExist._id,
        accessToken: accessToken,
      };
      return this.baseResponse.sendResponse(
        200,
        message.subscriber.OTP_VERIFIED,
        result,
      );
    } else {
      if (phoneNo) {
        userExist = await this.subscriberModel.findOne({ phoneNo }).lean(true);
        emailExist = userExist.email;
      } else {
        userExist = await this.subscriberModel
          .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
          .lean(true);
      }
      if (otp === userExist.otp) {
        const now = new Date();
        const createdAt = new Date(userExist.expiredDate);
        const minDifference = Math.floor(
          (now.getTime() - createdAt.getTime()) / 1000 / 60,
        );

        if (minDifference > 8) {
          return this.baseResponse.sendError(
            400,
            message.subscriber.OTP_EXPIRED,
            [],
          );
        }

        await this.subscriberModel.updateOne(
          { _id: userExist._id },
          { isVerified: 1, status: 'Verified' },
        );
        const isEmailExist = emailExist ? true : email ? true : false;

        const payload = {
          _id: userExist._id,
          phoneNo: userExist.phoneNo,
          sub: userExist._id,

          role: 'subscriber',
        };

        const accessToken = await this.jwtService.signAsync(payload, {
          expiresIn: '365d',
          secret: process.env.JWT_SECRET,
        });
        const result = {
          isEmailExist: isEmailExist,
          isOldUser: userExist.isOldUser,
          id: userExist._id,
          accessToken: accessToken,
        };
        return this.baseResponse.sendResponse(
          200,
          message.subscriber.OTP_VERIFIED,
          result,
        );
      } else {
        return this.baseResponse.sendResponse(400, 'Invalid OTP!!', []);
      }
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateSubscriberDto) {
    const user = await this.subscriberModel.findById(userId).exec();

    if (!user) {
      throw new HttpException(
        {
          message: message.subscriber.SUBSCRIBER_NOT_FOUND,
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateUserDto.stateId) {
      updateUserDto.stateId = new mongoose.Types.ObjectId(
        updateUserDto.stateId,
      );
    }
    if (updateUserDto.countryId) {
      updateUserDto.countryId = new mongoose.Types.ObjectId(
        updateUserDto.countryId,
      );
    }
    if (updateUserDto.districtId) {
      updateUserDto.districtId = new mongoose.Types.ObjectId(
        updateUserDto.districtId,
      );
    }
    if (updateUserDto.blockId) {
      updateUserDto.blockId = new mongoose.Types.ObjectId(
        updateUserDto.blockId,
      );
    }
    if (updateUserDto.healthFacilityId) {
      updateUserDto.healthFacilityId = new mongoose.Types.ObjectId(
        updateUserDto.healthFacilityId,
      );
    }
    if (updateUserDto.cadreId) {
      updateUserDto.cadreId = new mongoose.Types.ObjectId(
        updateUserDto.cadreId,
      );
    }
    await this.subscriberModel
      .findByIdAndUpdate(user._id, updateUserDto)
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_PROFILE,
      [],
    );
  }

  async userProfile(id: string) {
    console.log(`This action returns a #${id} Subscriber`);
    const manager = await this.instituteModel.findOne({
      subscriber: new mongoose.Types.ObjectId(id),
    });
    const subscriber = await this.subscriberModel.findById(id);
    if (manager && !subscriber?.userContext?.queryDetails.instituteId) {
      await this.subscriberModel.findByIdAndUpdate(
        id,
        {
          $set: {
            'userContext.queryDetails': {
              instituteId: new mongoose.Types.ObjectId(manager.instituteId),
              type: new mongoose.Types.ObjectId(manager.role),
              querySolved: 0,
              isActive: true,
            },
          },
        },
        { new: true },
      );
    }
    const userProgress: any =
      await this.SubscriberProgressServices.getOverallAchievement(id);

    let getSubscriberById: any = await this.subscriberModel
      .findById(id)
      .select('-otp -password -forgotOtpTime -id -isVerified')
      .exec();

    if (getSubscriberById?.userContext?.queryDetails) {
      await getSubscriberById.populate({
        path: 'userContext.queryDetails.type',
        select: 'name',
      });
    }
    if (!getSubscriberById) {
      throw new HttpException(
        {
          message: message.subscriber.SUBSCRIBER_NOT_FOUND,
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userProgress?.data) {
      getSubscriberById = {
        ...getSubscriberById.toObject(),
        ...userProgress.data, // Spread userProgress directly into the object
      };
    }
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_PROFILE_FETCH,
      getSubscriberById,
    );
  }

  async getSubscribersList(paginationDto: PaginationDto) {
    console.log(`This action return all subscriber with phoneNo details`);
    const { search } = paginationDto;
    let subscriber;
    if (!search) {
      console.log('inside if part to search all subscriber -->');
      subscriber = await this.subscriberModel
        .find()
        .populate({ path: 'cadreId', select: 'title' })
        .select('name phoneNo email cadreId');
    } else {
      console.log('inside else part to search specific -->');
      subscriber = await this.subscriberModel
        .find({
          $or: [
            { name: new RegExp(search, 'i') }, // Case-insensitive regex search for name
            { phoneNo: new RegExp(search, 'i') }, // Case-insensitive regex search for phone number
          ],
        })
        .populate({ path: 'cadreId', select: 'title' })
        .select('name phoneNo email cadreId');
    }
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_LIST,
      subscriber,
    );
  }

  async getAllSubscribers(paginationDto: PaginationDto, userId: string) {
    console.log(`This action returns all subscribers -->`);
    const query = await this.filterService.filter(paginationDto);
    const updatedQuery = await this.adminService.adminRoleFilter(
      userId,
      query,
      'subscriber',
    );
    const { states, districts, cadres, countries, blocks } = paginationDto;
    const subscriber = [
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'country',
          pipeline: countries
            ? [{ $match: { _id: new mongoose.Types.ObjectId(countries) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'states',
          localField: 'stateId',
          foreignField: '_id',
          as: 'state',
          pipeline: states
            ? [{ $match: { _id: new mongoose.Types.ObjectId(states) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'cadres',
          localField: 'cadreId',
          foreignField: '_id',
          as: 'cadre',
          pipeline: cadres
            ? [{ $match: { _id: new mongoose.Types.ObjectId(cadres) } }]
            : [],
        },
      },
      { $unwind: { path: '$cadre', preserveNullAndEmptyArrays: true } }, // Unwind cadreId first
      {
        $lookup: {
          from: 'primarycadres',
          localField: 'cadre.cadreGroup',
          foreignField: '_id',
          as: 'cadreGroup',
        },
      },
      { $unwind: { path: '$cadreGroup', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'districts',
          localField: 'districtId',
          foreignField: '_id',
          as: 'district',
          pipeline: districts
            ? [{ $match: { _id: new mongoose.Types.ObjectId(districts) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'blocks',
          localField: 'blockId',
          foreignField: '_id',
          as: 'block',
          pipeline: blocks
            ? [{ $match: { _id: new mongoose.Types.ObjectId(blocks) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'healthfacilities',
          localField: 'healthFacilityId',
          foreignField: '_id',
          as: 'healthFacility',
        },
      },
      { $match: updatedQuery },
      {
        $project: {
          name: 1,
          phoneNo: 1,
          email: 1,
          isOldUser: 1,
          isVerified: 1,
          status: 1,
          forgotOtpTime: 1,
          country: {
            $ifNull: [{ $arrayElemAt: ['$country.title', 0] }, ''],
          },
          state: {
            $ifNull: [{ $arrayElemAt: ['$state.title', 0] }, ''],
          },
          cadre: { $ifNull: ['$cadre.title', ''] },
          cadreGroup: { $ifNull: ['$cadreGroup.title', ''] },
          cadreType: { $ifNull: ['$cadre.cadreType', ''] },
          district: {
            $ifNull: [{ $arrayElemAt: ['$district.title', 0] }, ''],
          },
          block: {
            $ifNull: [{ $arrayElemAt: ['$block.title', 0] }, ''],
          },
          healthFacility: {
            $ifNull: [
              { $arrayElemAt: ['$healthFacility.healthFacilityCode', 0] },
              '',
            ],
          },
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M:%S', // Custom date format
              date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
              timezone: 'Asia/Kolkata',
            },
          },
        },
      },
    ];
    const nonNullChecks: any = {};
    if (countries) nonNullChecks['countries'] = { $ne: null };
    if (states) nonNullChecks['states'] = { $ne: null };
    if (cadres) nonNullChecks['cadres'] = { $ne: null };
    if (districts) nonNullChecks['districts'] = { $ne: null };
    if (blocks) nonNullChecks['blocks'] = { $ne: null };
    // Add the conditional non-null check match stage if there are any conditions
    if (Object.keys(nonNullChecks).length > 0) {
      subscriber.push({ $match: nonNullChecks });
    }
    // console.log('subscriber --->', JSON.stringify(subscriber));
    const result = await this.subscriberModel.aggregate(subscriber).exec();
    console.log('result length -->', result.length);
    return this.baseResponse.sendResponse(
      200,
      message.subscriber.SUBSCRIBER_LIST,
      result,
    );
  }

  async generateCsv(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      stringify(
        data,
        {
          header: true, // Include column headers
          columns: [
            { key: 'name', header: 'Name' },
            { key: 'phoneNo', header: 'Phone Number' },
            { key: 'email', header: 'Email' },
            { key: 'isVerified', header: 'Is Verified' },
            { key: 'forgotOtpTime', header: 'Forgot Otp Time' },
            { key: 'isOldUser', header: 'Is Old User' },
            { key: 'cadre', header: 'Cadre' },
            { key: 'cadreGroup', header: 'Primary Cadre' },
            { key: 'cadreType', header: 'Cadre Type' },
            { key: 'country', header: 'Country' },
            { key: 'state', header: 'State' },
            { key: 'district', header: 'District' },
            { key: 'block', header: 'Block' },
            { key: 'healthFacility', header: 'Health-Facility' },
            { key: 'createdAt', header: 'Created At' },
          ],
        },
        (err, output) => {
          if (err) {
            return reject(err);
          }
          resolve(output);
        },
      );
    });
  }

  async logout(refreshTokenDto: RefreshTokenDto) {
    console.log(`This action delete user token`);
    if (!refreshTokenDto.refreshToken) {
      return this.baseResponse.sendResponse(400, 'Token is required', []);
    }

    await this.refreshToken(refreshTokenDto);
    return this.baseResponse.sendResponse(
      200,
      'User Logout Successfully!!',
      [],
    );
  }

  async subscriberFlagUpdateScript() {
    console.log(`This Action run a script that changed status of user`);
    const subscriber = await this.subscriberModel
      .find()
      .select('name otp isVerified stateId');
    for (const user of subscriber) {
      // console.log('user --->', user);
      let status, isVerified;
      console.log(
        '!user.hasOwnProperty(name)',
        'name' in user,
        user.name == '',
      );
      if (!user.hasOwnProperty('status')) {
        if (
          user.hasOwnProperty('name') ||
          user.name == '' ||
          user.name == undefined
        ) {
          status = 'Unverified';
          isVerified = 0;
        } else {
          status = 'Verified';
          isVerified = 1;
        }
        console.log('status -->', user.name, status);
        await this.subscriberModel.updateOne(
          { _id: user._id },
          { status: status, isVerified: isVerified },
        );
      } else {
        continue;
      }

      // break;
    }
  }
}
