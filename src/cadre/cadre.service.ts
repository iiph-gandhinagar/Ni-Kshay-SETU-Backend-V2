import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateCadreDto } from './dto/create-cadre.dto';
import { UpdateCadreDto } from './dto/update-cadre.dto';
import { CadreDocument } from './entities/cadre.entity';

@Injectable()
export class CadreService {
  constructor(
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<CadreDocument> {
    console.log('inside find by property cadre----->');
    return this.cadreModel.findOne({ [property]: value }).exec();
  }
  async create(createCadreDto: CreateCadreDto) {
    console.log('This action adds a new cadre');
    if (createCadreDto.cadreGroup) {
      createCadreDto.cadreGroup = new mongoose.Types.ObjectId(
        createCadreDto.cadreGroup,
      );
    }
    const newCadre = await this.cadreModel.create(createCadreDto);
    return this.baseResponse.sendResponse(
      200,
      message.cadre.CADRE_CREATED,
      newCadre,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all cadre');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'cadreGroup', select: 'title' }, // Populate countryId and select only the name field
    ];
    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.cadreModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} cadre`);
    const getCareById = await this.cadreModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.cadre.CADRE_LIST,
      getCareById,
    );
  }

  async update(id: string, updateCadreDto: UpdateCadreDto) {
    console.log(`This action updates a #${id} cadre`);
    if (updateCadreDto.cadreGroup) {
      updateCadreDto.cadreGroup = new mongoose.Types.ObjectId(
        updateCadreDto.cadreGroup,
      );
    }
    const updateDetails = await this.cadreModel.findByIdAndUpdate(
      id,
      updateCadreDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.cadre.CADRE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} cadre`);
    const subscriber = await this.subscriberModel.findOne({ cadreId: id });
    if (subscriber) {
      throw new HttpException(
        {
          message: "Can't Delete cadre!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.cadreModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(200, message.cadre.CADRE_DELETE, []);
  }
}
