import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { MasterInstitute } from 'src/master-institute/entities/master-institute.entity';
import { QueryDocument } from 'src/query/entities/query.entity';
import { RoleDocument } from 'src/roles/entities/role.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import { TransferManagerDto } from './dto/transfer-manager.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { InstituteDocument } from './entities/institute.entity';

@Injectable()
export class InstituteService {
  constructor(
    @InjectModel('Institute')
    private readonly instituteModel: Model<InstituteDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('MasterInstitute')
    private readonly masterInstituteModel: Model<MasterInstitute>,
    @InjectModel('Role')
    private readonly roleModel: Model<RoleDocument>,

    @InjectModel('Query')
    private readonly queryModel: Model<QueryDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<InstituteDocument> {
    console.log('inside find by property Institute----->');
    return this.instituteModel.findOne({ [property]: value }).exec();
  }

  async create(
    createInstituteDto: CreateInstituteDto,
    userId: string,
    roleId: string,
  ) {
    console.log('This action adds a new Institute');
    const subscriberId = createInstituteDto.subscriber;
    const existInstitute = await this.instituteModel.findOne({
      instituteId: new mongoose.Types.ObjectId(createInstituteDto.instituteId),
    });

    if (existInstitute) {
      throw new HttpException(
        {
          message: [{ instituteId: 'Manager has already been added!' }],
          errors: 'Manager has already been added!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const idExists = await this.subscriberModel
      .findById(subscriberId)
      .select('phoneNo userContext.queryDetails email name');
    console.log('idExists --->', idExists);
    if (!idExists || !userId) {
      throw new HttpException(
        {
          message: 'Subscriber not found',
          errors: 'Subscriber not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Ensure that the subscriber is not already assigned to another institute
    if (idExists?.userContext?.queryDetails?.instituteId) {
      throw new HttpException(
        'Member is already assigned to another institute.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // console.log('existing institute --->', existInstitute);
    createInstituteDto.role = new mongoose.Types.ObjectId(
      createInstituteDto.role,
    );
    createInstituteDto.subscriber = new mongoose.Types.ObjectId(
      createInstituteDto.subscriber,
    );
    createInstituteDto.instituteId = new mongoose.Types.ObjectId(
      createInstituteDto.instituteId,
    );
    const roleName = await this.roleModel.findById(roleId).select('name');
    if (!roleName) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    console.log('Role name:', roleName.name);
    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST);
    }
    if (roleName.name === 'Admin') {
      createInstituteDto.createdBy = new mongoose.Types.ObjectId(userId);
    } else {
      createInstituteDto.createdByInstitute = new mongoose.Types.ObjectId(
        userId,
      );
    }

    const character = randomBytes(12)
      .toString('base64')
      .slice(0, 12)
      .replace(/[+/]/g, '');
    console.log('character', character);

    const saltRounds = 10; // Number of salt rounds, adjust as necessary
    createInstituteDto.password = await bcrypt.hash(character, saltRounds);
    const newInstitute = await this.instituteModel.create(createInstituteDto);

    await this.subscriberModel.findByIdAndUpdate(
      createInstituteDto.subscriber,
      {
        // Update specific fields within the queryDetails object
        $set: {
          'userContext.queryDetails.instituteId':
            createInstituteDto.instituteId,
          'userContext.queryDetails.type': createInstituteDto.role,
          'userContext.queryDetails.isActive': true,
        },
      },
      { new: true },
    );
    await this.emailService.sendPassword(
      createInstituteDto.email,
      idExists.name,
      character,
    );
    return this.baseResponse.sendResponse(
      200,
      message.institute.INSTITUTE_CREATED,
      newInstitute,
    );
  }

  async findAll(paginationDto: PaginationDto, user: any) {
    console.log('This action returns all Institute');
    const { _id, instituteId, role } = user;
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'role', select: 'name' }, // Populate Role and select only the name field
      { path: 'subscriber', select: 'name' }, // Populate Subscriber and select only the name field
      { path: 'instituteId', select: 'title' }, // Populate Institute Title and select only the name field
    ];
    const roleName = await this.roleModel.findById(role).select('name');

    const query = await this.filterService.filter(paginationDto);
    const andConditions: any[] = [];
    if (
      roleName.name === 'COE' ||
      roleName.name === 'NODAL' ||
      roleName.name === 'DRTB'
    ) {
      andConditions.push({
        $or: [
          { createdByInstitute: new mongoose.Types.ObjectId(_id) }, // NODAL can see queries they created
          { instituteId: new mongoose.Types.ObjectId(instituteId) }, // Or queries created by their institute
        ],
      });
      query.$and = andConditions;
    }
    return await paginate(
      this.instituteModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Institute`);
    const getInstituteById = await this.instituteModel
      .findById(id)
      .populate([
        {
          path: 'subscriber',
          select: 'name phoneNo cadreId',
          populate: {
            path: 'cadreId', // Then populate the cadreId inside subscriber
            select: 'title', // Select only the cadre name if needed
          },
        }, // Populate Subscriber and select only the name field
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.institute.INSTITUTE_LIST,
      getInstituteById,
    );
  }

  async update(id: string, updateInstituteDto: UpdateInstituteDto) {
    console.log(`This action updates a #${id} Institute`);
    if (updateInstituteDto.subscriber || updateInstituteDto.email) {
      const user = await this.subscriberModel.findById(
        updateInstituteDto.subscriber,
      );
      if (!user) {
        throw new HttpException('Subscriber not found', HttpStatus.NOT_FOUND);
      }
      const character = randomBytes(12)
        .toString('base64')
        .slice(0, 10)
        .replace(/[+/]/g, '');
      await this.emailService.sendPassword(
        updateInstituteDto.email,
        user.name,
        character,
      );
      /*  Mail to new manager */
      const saltRounds = 10; // Number of salt rounds, adjust as necessary
      updateInstituteDto.password = await bcrypt.hash(character, saltRounds);
    }
    const updateDetails = await this.instituteModel.findByIdAndUpdate(
      id,
      updateInstituteDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.institute.INSTITUTE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Institute`);
    const queries = await this.queryModel
      .findOne({
        queryRespondedInstitute: new mongoose.Types.ObjectId(id),
      })
      .select('query');
    if (queries) {
      throw new HttpException(
        {
          message: [
            { query: 'Please transfer your queries to another institute' },
          ],
          errors: 'Please transfer your queries to another institute',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const instituteId = await this.instituteModel
      .findById(id)
      .select('instituteId');
    await this.subscriberModel.updateMany(
      { 'userContext.queryDetails.instituteId': instituteId.instituteId },
      {
        $unset: {
          'userContext.queryDetails.instituteId': '',
          'userContext.queryDetails.type': '',
        },
      },
      { new: true },
    );
    await this.instituteModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.institute.INSTITUTE_DELETE,
      [],
    );
  }

  async addMember(addMemberDto: AddMemberDto) {
    console.log(`This action adds member in institute`);
    const { instituteId, instituteRole, subscriberId, isActive } = addMemberDto;
    const idExists = await this.subscriberModel
      .findById(subscriberId)
      .select('phoneNo userContext.queryDetails email name');
    if (!idExists) {
      throw new HttpException(
        {
          message: 'Member Not Found!!',
          errors: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      idExists.userContext.queryDetails.instituteId !== null &&
      idExists.userContext.queryDetails.instituteId !== undefined
    ) {
      throw new HttpException(
        {
          message: [
            { query: 'Member is already assigned to another institute.' },
          ],
          subscriberId: 'Member is already assigned to another institute.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const updateDetails = await this.subscriberModel.findByIdAndUpdate(
        subscriberId,
        {
          // Update specific fields within the queryDetails object
          $set: {
            'userContext.queryDetails.instituteId': instituteId,
            'userContext.queryDetails.type': instituteRole,
            'userContext.queryDetails.querySolved': 0,
            'userContext.queryDetails.isActive': isActive,
          },
        },
        { new: true, upsert: true },
      );
      const instituteName = await this.masterInstituteModel
        .findById(instituteId)
        .select('title');
      await this.emailService.sendWelcomeMember(
        idExists.email,
        idExists.name,
        instituteName.title,
      );

      return this.baseResponse.sendResponse(
        200,
        message.institute.INSTITUTE_ADD_MEMBER,
        updateDetails,
      );
    } catch (error) {
      console.error(
        '❌ Error in Updating Subscriber Data in Add Member:',
        error,
      );
      return {
        status: false,
        message: '❌ Error in Updating Subscriber Data in Add Member:',
        error: error,
      };
    }
  }

  async getMembersOfInstitute(instituteId: string) {
    console.log(`This Action returns institute members`);
    const members = await this.subscriberModel
      .find({
        'userContext.queryDetails.instituteId': instituteId,
      })
      .populate([
        { path: 'userContext.queryDetails.type', select: 'name' }, // Populate Role and select only the name field
        { path: 'cadreId', select: 'title' }, // Populate Subscriber and select only the name field
        { path: 'userContext.queryDetails.instituteId', select: 'title' },
      ])
      .select('email name phoneNo cadre userContext.queryDetails');
    return this.baseResponse.sendResponse(
      200,
      message.institute.INSTITUTE_MEMBER_LIST,
      members,
    );
  }

  async deleteMember(deleteMemberDto: DeleteMemberDto) {
    console.log(`this Action delete member from institute`);
    await this.subscriberModel.findByIdAndUpdate(
      deleteMemberDto.subscriberId,
      {
        $unset: {
          'userContext.queryDetails.instituteId': '',
          'userContext.queryDetails.type': '',
        },
      },
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      'Member Deleted Successfully!',
      [],
    );
  }

  async transferManager(
    userId: string,
    transferManagerDto: TransferManagerDto,
  ) {
    console.log(`This Action update Manger details`);

    try {
      transferManagerDto.subscriberId = new mongoose.Types.ObjectId(
        transferManagerDto.subscriberId,
      );
      const user = await this.subscriberModel.findById(
        transferManagerDto.subscriberId,
      );
      if (!user) {
        throw new HttpException('Subscriber not found', HttpStatus.NOT_FOUND);
      }
      if (
        user.userContext.queryDetails.instituteId !== null &&
        user.userContext.queryDetails.instituteId !== undefined
      ) {
        throw new HttpException(
          {
            message: [
              { query: 'Member is already assigned to another institute.' },
            ],
            subscriberId: 'Member is already assigned to another institute.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const character = randomBytes(12)
        .toString('base64')
        .slice(0, 10)
        .replace(/[+/]/g, '');
      /*  Mail to new manager */
      const saltRounds = 10; // Number of salt rounds, adjust as necessary
      transferManagerDto.password = await bcrypt.hash(character, saltRounds);
      transferManagerDto.subscriber = new mongoose.Types.ObjectId(
        transferManagerDto.subscriberId,
      );
      const instituteId = transferManagerDto.instituteId;
      delete transferManagerDto.instituteId;
      await this.instituteModel.updateOne(
        {
          instituteId: new mongoose.Types.ObjectId(instituteId),
        },
        transferManagerDto,
      );
      const instituteRole = await this.instituteModel
        .findOne({
          instituteId: new mongoose.Types.ObjectId(instituteId),
        })
        .select('role');
      await this.subscriberModel.findByIdAndUpdate(
        transferManagerDto.subscriberId,
        {
          $set: {
            'userContext.queryDetails.instituteId': new mongoose.Types.ObjectId(
              instituteId,
            ),
            'userContext.queryDetails.type': instituteRole.role,
          },
        },
        { new: true },
      );

      await this.emailService.sendPassword(
        transferManagerDto.email,
        user.name,
        character,
      );
      return this.baseResponse.sendResponse(
        200,
        message.institute.INSTITUTE_TRANSFER_MANAGER,
        [],
      );
    } catch (error) {
      console.error(
        '❌ Error in Updating Institute manager Data (transfer Query):',
        error,
      );
      return {
        status: false,
        message: 'Error Updating Institute manager Data (transfer Query)',
        error: error,
      };
    }
  }
}
