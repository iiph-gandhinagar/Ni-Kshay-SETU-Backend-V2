import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourDocument } from './entities/tour.entity';

@Injectable()
export class TourService {
  constructor(
    @InjectModel('Tour')
    private readonly tourModel: Model<TourDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(property: string, value: string): Promise<TourDocument> {
    console.log('inside find by property Tour----->');
    return this.tourModel.findOne({ [property]: value }).exec();
  }

  async create(createTourDto: CreateTourDto) {
    console.log('This action adds a new Tour');
    console.log('createTour --->', createTourDto);
    const activeTour = await this.tourModel.find({ active: true });
    if (activeTour.length > 0 && createTourDto.active === true) {
      throw new HttpException(
        {
          message:
            'Another tour is already active. Do you want to disable it and activate the current tour?',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const newTours = await this.tourModel.create(createTourDto);
    return this.baseResponse.sendResponse(
      200,
      message.tour.TOUR_CREATED,
      newTours,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Tour');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.tourModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Tour`);
    const getTourById = await this.tourModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.tour.TOUR_LIST,
      getTourById,
    );
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    console.log(`This action updates a #${id} Tour`);
    const activeTour = await this.tourModel.find({ active: true });
    if (activeTour.length > 0 && updateTourDto.active === true) {
      throw new HttpException(
        {
          message:
            'Another tour is already active. Do you want to disable it and activate the current tour?',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateDetails = await this.tourModel.findByIdAndUpdate(
      id,
      updateTourDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.tour.TOUR_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Tour`);
    await this.tourModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(200, message.tour.TOUR_DELETE, []);
  }

  async tourWithTourSlides() {
    const activeTour = await this.tourModel.find({ active: true });
    if (activeTour.length == 0) {
      const defaultTour = await this.tourModel.find({ default: true });
      if (defaultTour.length === 0) {
        return this.baseResponse.sendResponse(200, message.tour.TOUR_LIST, []);
      }
      return this.baseResponse.sendResponse(
        200,
        message.tour.TOUR_LIST,
        defaultTour[0].tourSlides,
      );
    }
    return this.baseResponse.sendResponse(
      200,
      message.tour.TOUR_LIST,
      activeTour[0].tourSlides,
    );
  }
}
