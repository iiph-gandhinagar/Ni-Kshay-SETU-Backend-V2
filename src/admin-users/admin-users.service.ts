import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { InstituteDocument } from 'src/institute/entities/institute.entity';
import { TokenVerificationDto } from 'src/temporary-token/dto/token-verification.dto';
import { TemporaryTokenDocument } from 'src/temporary-token/entities/temporary-token.entity';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUserDocument } from './entities/admin-user.entity';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('AdminUser')
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel('Institute')
    private readonly InstituteModel: Model<InstituteDocument>,
    @InjectModel('TemporaryToken')
    private readonly temporaryTokenModel: Model<TemporaryTokenDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<AdminUserDocument> {
    console.log('inside find by property Admin User----->');
    return this.adminUserModel.findOne({ [property]: value }).exec();
  }
  async validateUser(email: string, password: string) {
    const user = await this.adminUserModel.findOne({ email }).exec();
    if (!user) {
      return null; // User not found
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null; // Password does not match
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.adminUserModel.findOne({ email: email });
    let payload;
    if (!user) {
      const manager = await this.InstituteModel.findOne({
        email: email,
      }).populate('subscriber');
      if (!manager) {
        return message.auth.INVALID_CREDENTIALS;
      }
      const passwordMatch = await bcrypt.compare(password, manager.password);

      if (!passwordMatch) {
        return message.auth.INVALID_CREDENTIALS;
      }
      const name = manager.subscriber as any;
      payload = {
        _id: manager._id,
        name: name,
        role: manager.role,
        email: manager.email,
        instituteId: manager.instituteId,
      };
    } else {
      if (!user) {
        return message.auth.INVALID_CREDENTIALS;
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return message.auth.INVALID_CREDENTIALS;
      }

      payload = {
        _id: user._id,
        name: user.firstName,
        role: user.role,
        email: user.email,
      };
    }

    return {
      user_details: payload,
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '365d',
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async create(createAdminUserDto: CreateAdminUserDto) {
    console.log('This action adds a new Admin User');
    const { password } = createAdminUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    createAdminUserDto.role = new mongoose.Types.ObjectId(
      createAdminUserDto.role,
    );
    createAdminUserDto.countryId = new mongoose.Types.ObjectId(
      createAdminUserDto.countryId,
    );
    createAdminUserDto.state = createAdminUserDto.state.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    createAdminUserDto.cadre = createAdminUserDto.cadre.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    createAdminUserDto.district = createAdminUserDto.district.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    createAdminUserDto.password = hashedPassword;
    const newAdminUser = await this.adminUserModel.create(createAdminUserDto);
    return this.baseResponse.sendResponse(
      200,
      message.adminUser.ADMIN_USER_CREATED,
      newAdminUser,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Admin User');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
      { path: 'state', select: 'title' }, // Populate state and select only the name field
      { path: 'district', select: 'title' }, // Populate district and select only the name field
      { path: 'cadre', select: 'title' }, // Populate cadre and select only the name field
      { path: 'role', select: 'name' }, // Populate role and select only the name field
    ];
    const query = await this.filterService.filter(paginationDto);
    const result = await paginate(
      this.adminUserModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
    return this.baseResponse.sendResponse(
      200,
      message.adminUser.ADMIN_USER_LIST,
      result,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Admin User`);
    const getAdminUserById = await this.adminUserModel.findById(id).exec();
    if (!getAdminUserById) {
      throw new HttpException(
        {
          message: 'User Not Found',
          errors: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.baseResponse.sendResponse(
      200,
      message.adminUser.ADMIN_USER_LIST,
      getAdminUserById,
    );
  }

  async getUserProfile(userId: string) {
    const adminUser = await this.adminUserModel
      .findById(userId)
      .populate([
        { path: 'role' },
        { path: 'state', select: 'title' },
        { path: 'district', select: 'title stateId' },
        { path: 'cadre', select: 'title' },
      ])
      .exec();
    if (!adminUser) {
      throw new HttpException(
        {
          message: 'User Not Found',
          errors: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.baseResponse.sendResponse(
      200,
      message.adminUser.ADMIN_USER_PROFILE,
      adminUser,
    );
  }

  async update(id: string, updateAdminUserDto: UpdateAdminUserDto) {
    console.log(`This action updates a #${id} Admin User`);
    if (updateAdminUserDto.password && updateAdminUserDto.password != '') {
      updateAdminUserDto.password = await bcrypt.hash(
        updateAdminUserDto.password,
        10,
      );
    }
    if (updateAdminUserDto.role) {
      updateAdminUserDto.role = new mongoose.Types.ObjectId(
        updateAdminUserDto.role,
      );
    }

    if (updateAdminUserDto.countryId) {
      updateAdminUserDto.countryId = new mongoose.Types.ObjectId(
        updateAdminUserDto.countryId,
      );
    }

    if (updateAdminUserDto.state) {
      updateAdminUserDto.state = updateAdminUserDto.state.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (updateAdminUserDto.cadre) {
      updateAdminUserDto.cadre = updateAdminUserDto.cadre.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (updateAdminUserDto.district) {
      updateAdminUserDto.district = updateAdminUserDto.district.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    const updateDetail = await this.adminUserModel.findByIdAndUpdate(
      id,
      updateAdminUserDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.adminUser.ADMIN_USER_UPDATED,
      updateDetail,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Admin User`);
    await this.adminUserModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.adminUser.ADMIN_USER_DELETE,
      [],
    );
  }

  async forgotEmail(email: string) {
    console.log(`This Action get email and send link to change password`);
    const adminUser = await this.adminUserModel.findOne({ email: email });
    if (!adminUser) {
      throw new HttpException(
        {
          message: 'User Not Found',
          errors: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const payload = {
      name: adminUser.firstName,
      email: email,
      token: btoa(
        Math.random().toString(36).substring(2) + Date.now().toString(36),
      ),
      expiredDate: tomorrow,
      adminUserId: adminUser._id,
    };
    await this.temporaryTokenModel.create(payload);
    await this.emailService.forgotPasswordEmail(email, payload.token);
    return this.baseResponse.sendResponse(
      200,
      'Link send to your Email Address',
      [],
    );
  }

  async verifiedToken(tokenVerificationDto: TokenVerificationDto) {
    console.log(`This action verify token and update password`);
    const { password, email, token } = tokenVerificationDto;
    const tokenVerification = await this.temporaryTokenModel.findOne({
      email: email,
      token: token,
    });
    if (!tokenVerification) {
      throw new HttpException(
        {
          message: 'token Not Found',
          errors: 'BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (new Date() > tokenVerification.expiredDate) {
      throw new HttpException(
        {
          message: 'token Expired!',
          errors: 'BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.adminUserModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(tokenVerification.adminUserId),
      },
      { password: hashedPassword },
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      'Password changed Successfully!',
      [],
    );
  }
}
