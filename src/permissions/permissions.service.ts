import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionDocument } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel('Permission')
    private readonly permissionModel: Model<PermissionDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(property: any, value: any) {
    console.log('inside find by property Permission ----->');
    return this.permissionModel.findOne({ [property]: value });
  }

  async create(createPermissionDto: CreatePermissionDto) {
    console.log('This action adds a new Permission');
    const newPermission =
      await this.permissionModel.create(createPermissionDto);
    return this.baseResponse.sendResponse(
      200,
      message.permission.PERMISSION_CREATED,
      newPermission,
    );
  }

  async findAllPermission() {
    const getPermissionById = await this.permissionModel.find();
    return this.baseResponse.sendResponse(
      200,
      message.permission.PERMISSION_LIST,
      getPermissionById,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Permissions');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.permissionModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Permission`);
    const getPermissionById = await this.permissionModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.permission.PERMISSION_LIST,
      getPermissionById,
    );
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    console.log(`This action updates a #${id} permission`);
    const updateDetails = await this.permissionModel.findByIdAndUpdate(
      id,
      updatePermissionDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.permission.PERMISSION_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} permission`);
    await this.permissionModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.permission.PERMISSION_DELETE,
      [],
    );
  }
}
