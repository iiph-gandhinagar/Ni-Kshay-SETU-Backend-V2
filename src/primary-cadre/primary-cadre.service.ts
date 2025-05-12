import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreatePrimaryCadreDto } from './dto/create-primary-cadre.dto';
import { UpdatePrimaryCadreDto } from './dto/update-primary-cadre.dto';
import { PrimaryCadreDocument } from './entities/primary-cadre.entity';

@Injectable()
export class PrimaryCadreService {
  constructor(
    @InjectModel('PrimaryCadre')
    private readonly primaryCadreModel: Model<PrimaryCadreDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<PrimaryCadreDocument> {
    console.log('inside find by property Primary Cadre----->');
    return this.primaryCadreModel.findOne({ [property]: value }).exec();
  }
  async create(createPrimaryCadreDto: CreatePrimaryCadreDto) {
    console.log('This action adds a new Primary Cadre');
    const newPrimaryCadre = await this.primaryCadreModel.create(
      createPrimaryCadreDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.primaryCadre.PRIMARY_CADRE_CREATED,
      newPrimaryCadre,
    );
  }

  async getAllPrimaryCadres() {
    console.log('This action returns all Primary Cadre');
    const getAllCadre = await this.primaryCadreModel.find();
    return this.baseResponse.sendResponse(
      200,
      message.primaryCadre.PRIMARY_CADRE_LIST,
      getAllCadre,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Primary Cadre');
    const query = await this.filterService.filter(paginationDto);

    return await paginate(this.primaryCadreModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Ap Config`);
    const getPrimaryCadreById = await this.primaryCadreModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.primaryCadre.PRIMARY_CADRE_LIST,
      getPrimaryCadreById,
    );
  }

  async update(id: string, updatePrimaryCadreDto: UpdatePrimaryCadreDto) {
    console.log(`This action updates a #${id} Primary Cadre`);
    const updateDetails = await this.primaryCadreModel.findByIdAndUpdate(
      id,
      updatePrimaryCadreDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.primaryCadre.PRIMARY_CADRE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Primary Cadre`);
    const cadres = await this.cadreModel.find({ cadreGroup: id });
    if (cadres && cadres.length > 0) {
      throw new HttpException(
        {
          message: 'primary-cadre In use!',
          errors: 'primary-cadre In use!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.primaryCadreModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.primaryCadre.PRIMARY_CADRE_DELETE,
      [],
    );
  }
}
