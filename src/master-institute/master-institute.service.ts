import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { InstituteDocument } from 'src/institute/entities/institute.entity';
import { RoleDocument } from 'src/roles/entities/role.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateMasterInstituteDto } from './dto/create-master-institute.dto';
import { UpdateMasterInstituteDto } from './dto/update-master-institute.dto';
import { MasterInstituteDocument } from './entities/master-institute.entity';

@Injectable()
export class MasterInstituteService {
  constructor(
    @InjectModel('AdminUser')
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel('MasterInstitute')
    private readonly masterInstituteModel: Model<MasterInstituteDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('Role')
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel('Institute')
    private readonly instituteModel: Model<InstituteDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<MasterInstituteDocument> {
    console.log('inside find by property Master Institute----->');
    return this.masterInstituteModel.findOne({ [property]: value }).exec();
  }
  async create(
    createMasterInstituteDto: CreateMasterInstituteDto,
    userId: string,
  ) {
    console.log('This action adds a new Master Institute');
    createMasterInstituteDto.createdBy = new mongoose.Types.ObjectId(userId);
    createMasterInstituteDto.countryId = new mongoose.Types.ObjectId(
      createMasterInstituteDto.countryId,
    );
    createMasterInstituteDto.stateId = new mongoose.Types.ObjectId(
      createMasterInstituteDto.stateId,
    );
    createMasterInstituteDto.districtId = new mongoose.Types.ObjectId(
      createMasterInstituteDto.districtId,
    );
    createMasterInstituteDto.role = new mongoose.Types.ObjectId(
      createMasterInstituteDto.role,
    );
    if (createMasterInstituteDto.parentId) {
      createMasterInstituteDto.parentId = new mongoose.Types.ObjectId(
        createMasterInstituteDto.parentId,
      );
    }
    const newMasterInstitute = await this.masterInstituteModel.create(
      createMasterInstituteDto,
    );

    // const masterInstitute = await newMasterInstitute.save();
    return this.baseResponse.sendResponse(
      200,
      message.masterInstitute.MASTER_INSTITUTE_CREATED,
      newMasterInstitute,
    );
  }

  async findInstitute() {
    console.log(
      `Get All Institute Details without Pagination -->For Transfer Query Institute List `,
    );
    const institute = await this.masterInstituteModel.aggregate([
      {
        $lookup: {
          from: 'roles', // The collection name of the Role model
          localField: 'role', // Field in masterInstituteModel that references Role
          foreignField: '_id', // The referenced field in the Role collection
          as: 'typeDetails', // Alias for the joined Role data
        },
      },
      {
        $unwind: '$typeDetails', // Unwind to access matched Role document
      },
      {
        $match: {
          $or: [{ 'typeDetails.name': 'COE' }, { 'typeDetails.name': 'NODAL' }],
        },
      },
      {
        $project: {
          _id: 1,
          role: 1,
          title: 1,
          typeDetails: 1,
        },
      },
    ]);
    return this.baseResponse.sendResponse(
      200,
      message.masterInstitute.MASTER_INSTITUTE_LIST,
      institute,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Master Institute');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'parentId', select: 'title role' },
    ];
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.masterInstituteModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Master Institute`);
    const getMasterInstituteById = await this.masterInstituteModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.masterInstitute.MASTER_INSTITUTE_LIST,
      getMasterInstituteById,
    );
  }

  async update(id: string, updateMasterInstituteDto: UpdateMasterInstituteDto) {
    console.log(`This action updates a #${id} Master Institute`);
    const updateDetails = await this.masterInstituteModel.findByIdAndUpdate(
      id,
      updateMasterInstituteDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.masterInstitute.MASTER_INSTITUTE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Master Institute`);
    await this.subscriberModel.updateMany(
      { 'userContext.queryDetails.instituteId': id },
      {
        $unset: {
          'userContext.queryDetails.instituteId': '',
          'userContext.queryDetails.type': '',
        },
      },
      { new: true },
    );
    await this.masterInstituteModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.masterInstitute.MASTER_INSTITUTE_DELETE,
      [],
    );
  }

  async parentInstitute(type: string) {
    /* This parent Institute API is For Add Master Data of Institute (access only IIPHG and Team) */
    console.log(`This action returns parent Institute of type ${type}`);
    const role = await this.roleModel.findById(type).select('name');
    if (!role) {
      throw new HttpException(
        {
          message: { Role: 'Role Not Found!!' },
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('role --->', role);
    let parents;
    if (role.name === 'NODAL') {
      parents = await this.masterInstituteModel.aggregate([
        {
          $lookup: {
            from: 'roles', // The collection name of the Role model
            localField: 'role', // Field in masterInstituteModel that references Role
            foreignField: '_id', // The referenced field in the Role collection
            as: 'typeDetails', // Alias for the joined Role data
          },
        },
        {
          $unwind: '$typeDetails', // Unwind to access matched Role document
        },
        {
          $match: {
            'typeDetails.name': 'COE', // Match the Role name
          },
        },
        {
          $project: {
            _id: 1,
            role: 1,
            title: 1,
          },
        },
      ]);
    } else if (role.name === 'DRTB') {
      parents = await this.masterInstituteModel.aggregate([
        {
          $lookup: {
            from: 'roles', // The collection name of the Role model
            localField: 'role', // Field in masterInstituteModel that references Role
            foreignField: '_id', // The referenced field in the Role collection
            as: 'typeDetails', // Alias for the joined Role data
          },
        },
        {
          $unwind: '$typeDetails', // Unwind to access matched Role document
        },
        {
          $match: {
            'typeDetails.name': 'NODAL', // Match the Role name
          },
        },
        {
          $project: {
            _id: 1,
            role: 1,
            title: 1,
          },
        },
      ]);
    } else {
      parents = [];
    }
    return this.baseResponse.sendResponse(
      200,
      message.masterInstitute.MASTER_INSTITUTE_LIST,
      parents,
    );
  }

  async instituteList(type: string, managerId: string) {
    /* Need Drop Down list of type based on login user (FE) eg .COE user can se type NODAL and DRTB and NODAL can see type DRTB only */
    /* This Api used for different Role like COE and NODAL for add member institute Drop Down ( For manager add in institute) */
    console.log(
      `This Action return child institute of managerId  based on type ${type}`,
    );
    const role = await this.roleModel.findById(type).select('name');
    if (!role) {
      throw new HttpException(
        {
          message: { Role: 'Role Not Found!!' },
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const instituteId = await this.instituteModel
      .findById(managerId)
      .select('instituteId');
    let instituteList;
    if (!instituteId) {
      const adminUserRole = await this.adminUserModel
        .findById(managerId)
        .populate({ path: 'role', select: 'name' })
        .lean();
      if (adminUserRole?.role) {
        const roles = adminUserRole.role as any; // Temporary type cast
        console.log('Role Name:', roles.name);
        if (roles.name === 'Admin') {
          instituteList = await this.masterInstituteModel.aggregate([
            {
              $lookup: {
                from: 'roles', // The collection name of the Role model
                localField: 'role', // Field in masterInstituteModel that references Role
                foreignField: '_id', // The referenced field in the Role collection
                as: 'typeDetails', // Alias for the joined Role data
              },
            },
            {
              $unwind: '$typeDetails', // Unwind to access matched Role document
            },
            {
              $match: {
                'typeDetails.name': role.name, // Match the Role name
              },
            },
            {
              $project: {
                _id: 1,
                typeDetails: 1,
                title: 1,
              },
            },
          ]);
        }
      }
    } else {
      instituteList = await this.masterInstituteModel.aggregate([
        {
          $lookup: {
            from: 'roles', // The collection name of the Role model
            localField: 'role', // Field in masterInstituteModel that references Role
            foreignField: '_id', // The referenced field in the Role collection
            as: 'typeDetails', // Alias for the joined Role data
          },
        },
        {
          $unwind: '$typeDetails', // Unwind to access matched Role document
        },
        {
          $match: {
            'typeDetails.name': role.name, // Match the Role name
            parentId: instituteId.instituteId, // Match the parentId field with the input ID
          },
        },
        {
          $project: {
            _id: 1,
            typeDetails: 1,
            parentId: 1,
            title: 1,
          },
        },
      ]);
    }

    return this.baseResponse.sendResponse(
      200,
      message.masterInstitute.MASTER_INSTITUTE_PARENT_INSTITUTE_LIST,
      instituteList,
    );
  }
}
