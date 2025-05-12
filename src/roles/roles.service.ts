import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDocument } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel('Role')
    private readonly rolesModel: Model<RoleDocument>,
    @InjectModel('AdminUser')
    private readonly adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByRoleAndPermission(role: string, action: string) {
    console.log('inside find role and its permissions----->', action);
    const roles = await this.rolesModel
      .findOne({ _id: role, permission: { $in: [action] } })
      .exec();
    if (roles) {
      return true; // Role has the required permission
    }
    return false;
  }

  async findByProperty(property: string, value: string): Promise<RoleDocument> {
    console.log('inside find by property role----->');
    return await this.rolesModel.findOne({ [property]: value }).exec();
  }
  async findAdminUser(value: string): Promise<RoleDocument> {
    console.log('inside find by property role----->', value);
    return await this.rolesModel.findById(value).exec();
  }
  async findAllRole() {
    console.log(`This Action return all roles`);
    const role = await this.rolesModel.find();
    return this.baseResponse.sendResponse(200, message.role.ROLE_LIST, role);
  }

  async create(createRoleDto: CreateRoleDto) {
    console.log('This action adds a new role');
    const newRole = await this.rolesModel.create(createRoleDto);
    return this.baseResponse.sendResponse(
      200,
      message.role.ROLE_CREATED,
      newRole,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all roles');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.rolesModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} role`);
    const getRolesById = await this.rolesModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.role.ROLE_LIST,
      getRolesById,
    );
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    console.log(`This action updates a #${id} role`);
    const updateDetails = await this.rolesModel.findByIdAndUpdate(
      id,
      updateRoleDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.role.ROLE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} role`);
    const adminUser = await this.adminUserModel.findOne({ role: id });
    if (adminUser) {
      throw new HttpException(
        {
          message: "Can't Delete Role!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.rolesModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(200, message.role.ROLE_DELETE, []);
  }
}
