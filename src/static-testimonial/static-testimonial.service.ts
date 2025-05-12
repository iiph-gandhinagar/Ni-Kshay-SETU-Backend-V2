import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticTestimonialDto } from './dto/create-static-testimonial.dto';
import { UpdateStaticTestimonialDto } from './dto/update-static-testimonial.dto';
import { StaticTestimonialDocument } from './entities/static-testimonial.entity';

@Injectable()
export class StaticTestimonialService {
  constructor(
    @InjectModel('StaticTestimonial')
    private readonly staticTestimonialModel: Model<StaticTestimonialDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticTestimonialDocument> {
    console.log('inside find by property Static Testimonial----->');
    return this.staticTestimonialModel.findOne({ [property]: value }).exec();
  }

  async create(createStaticTestimonialDto: CreateStaticTestimonialDto) {
    console.log('This action adds a new Testimonial');
    const newStaticTestimonial = await this.staticTestimonialModel.create(
      createStaticTestimonialDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticTestimonial.STATIC_TESTIMONIAL_CREATED,
      newStaticTestimonial,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Static Testimonial');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.staticTestimonialModel,
      paginationDto,
      [],
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Static Testimonial`);
    const getStaticTestimonialById =
      await this.staticTestimonialModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticTestimonial.STATIC_TESTIMONIAL_LIST,
      getStaticTestimonialById,
    );
  }

  async update(
    id: string,
    updateStaticTestimonialDto: UpdateStaticTestimonialDto,
  ) {
    console.log(`This action updates a #${id} Static Testimonial`);
    const updateDetails = await this.staticTestimonialModel.findByIdAndUpdate(
      id,
      updateStaticTestimonialDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticTestimonial.STATIC_TESTIMONIAL_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Static Testimonial`);
    await this.staticTestimonialModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticTestimonial.STATIC_TESTIMONIAL_DELETE,
      [],
    );
  }
}
