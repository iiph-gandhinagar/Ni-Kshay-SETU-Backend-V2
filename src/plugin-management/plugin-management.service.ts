import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreatePluginManagementDto } from './dto/create-plugin-management.dto';
import { UpdatePluginManagementDto } from './dto/update-plugin-management.dto';
import { PluginManagementDocument } from './entities/plugin-management.entity';

@Injectable()
export class PluginManagementService {
  constructor(
    @InjectModel('PluginManagement')
    private readonly pluginManagementModel: Model<PluginManagementDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}
  async findByProperty(
    property: string,
    value: string,
  ): Promise<PluginManagementDocument> {
    console.log('inside find by property Plugin Management----->');
    return this.pluginManagementModel.findOne({ [property]: value }).exec();
  }

  async create(createPluginManagementDto: CreatePluginManagementDto) {
    console.log('This action adds a new Plugin Management');
    createPluginManagementDto.cadreId = createPluginManagementDto.cadreId.map(
      (item) => new mongoose.Types.ObjectId(item),
    );
    const newPluginManagement = await this.pluginManagementModel.create(
      createPluginManagementDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.pluginManagement.PLUGIN_MANAGEMENT_CREATED,
      newPluginManagement,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Plugin Management');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'cadreId', select: 'title' },
    ];
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.pluginManagementModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Plugin Management`);
    const getAssessmentById = await this.pluginManagementModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.pluginManagement.PLUGIN_MANAGEMENT_LIST,
      getAssessmentById,
    );
  }

  async update(
    id: string,
    updatePluginManagementDto: UpdatePluginManagementDto,
  ) {
    console.log(`This action updates a #${id} pluginManagementModel`);

    if (updatePluginManagementDto.cadreId) {
      updatePluginManagementDto.cadreId = updatePluginManagementDto.cadreId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    const updateDetails = await this.pluginManagementModel.findByIdAndUpdate(
      id,
      updatePluginManagementDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.pluginManagement.PLUGIN_MANAGEMENT_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Plugin Management`);
    await this.pluginManagementModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.pluginManagement.PLUGIN_MANAGEMENT_DELETE,
      [],
    );
  }
}
