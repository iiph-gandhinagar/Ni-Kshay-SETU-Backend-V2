import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateMasterCmDto } from './dto/create-master-cm.dto';
import { UpdateMasterCmDto } from './dto/update-master-cm.dto';
import { MasterCmDocument } from './entities/master-cm.entity';

@Injectable()
export class MasterCmsService {
  constructor(
    @InjectModel('MasterCm')
    private readonly masterCmsModel: Model<MasterCmDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<MasterCmDocument> {
    console.log('inside find by property Master Cms----->');
    return this.masterCmsModel.findOne({ [property]: value }).exec();
  }
  async create(createMasterCmDto: CreateMasterCmDto) {
    console.log('This action adds a new Master Cms');
    const newMasterCms = await this.masterCmsModel.create(createMasterCmDto);
    return this.baseResponse.sendResponse(
      200,
      message.masterCms.MASTER_CMS_CREATED,
      newMasterCms,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Master Cms');

    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.masterCmsModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Master Cms`);
    const getMasterCmsById = await this.masterCmsModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.masterCms.MASTER_CMS_LIST,
      getMasterCmsById,
    );
  }

  async findAboutUs() {
    console.log(`This action returns about us content`);
    const getAboutUs = await this.masterCmsModel.findOne({
      title: new RegExp('About', 'i'),
    });
    return this.baseResponse.sendResponse(
      200,
      message.masterCms.MASTER_CMS_LIST,
      getAboutUs,
    );
  }

  async update(id: string, updateMasterCmDto: UpdateMasterCmDto) {
    console.log(`This action updates a #${id} Master Cms`);
    const updateDetails = await this.masterCmsModel.findByIdAndUpdate(
      id,
      updateMasterCmDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.masterCms.MASTER_CMS_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Master Cms`);
    await this.masterCmsModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.masterCms.MASTER_CMS_DELETE,
      [],
    );
  }
}
