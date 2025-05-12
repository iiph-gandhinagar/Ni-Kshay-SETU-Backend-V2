import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoClient } from 'mongodb';
import { Model } from 'mongoose';
import { AssessmentResponseDocument } from 'src/assessment-response/entities/assessment-response.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticTestimonialDocument } from 'src/static-testimonial/entities/static-testimonial.entity';
import { StaticWhatWeDoDocument } from 'src/static-what-we-do/entities/static-what-we-do.entity';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateStaticKeyFeatureDto } from './dto/create-static-key-feature.dto';
import { UpdateStaticKeyFeatureDto } from './dto/update-static-key-feature.dto';
import { StaticKeyFeatureDocument } from './entities/static-key-feature.entity';

@Injectable()
export class StaticKeyFeatureService {
  constructor(
    @InjectModel('AssessmentResponse')
    private readonly assessmentResponseModel: Model<AssessmentResponseDocument>,
    @InjectModel('StaticKeyFeature')
    private readonly staticKeyFeatureModel: Model<StaticKeyFeatureDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('StaticTestimonial')
    private readonly staticTestimonialModel: Model<StaticTestimonialDocument>,
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @InjectModel('StaticWhatWeDo')
    private readonly staticWhatWeDoModel: Model<StaticWhatWeDoDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticKeyFeatureDocument> {
    console.log('inside find by property Static Key Feature----->');
    return this.staticKeyFeatureModel.findOne({ [property]: value }).exec();
  }

  async create(createStaticKeyFeatureDto: CreateStaticKeyFeatureDto) {
    console.log('This action adds a new Key Feature');
    const newStaticKeyFeature = await this.staticKeyFeatureModel.create(
      createStaticKeyFeatureDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticKeyFeature.STATIC_KEY_FEATURE_CREATED,
      newStaticKeyFeature,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Static Key Feature');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticKeyFeatureModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Static Key Feature`);
    const getStaticKeyFeatureById =
      await this.staticKeyFeatureModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticKeyFeature.STATIC_KEY_FEATURE_LIST,
      getStaticKeyFeatureById,
    );
  }

  async update(
    id: string,
    updateStaticKeyFeatureDto: UpdateStaticKeyFeatureDto,
  ) {
    console.log(`This action updates a #${id} Static Key Feature`);
    const updateDetails = await this.staticKeyFeatureModel.findByIdAndUpdate(
      id,
      updateStaticKeyFeatureDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticKeyFeature.STATIC_KEY_FEATURE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Static Web Key Feature`);
    await this.staticKeyFeatureModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticKeyFeature.STATIC_KEY_FEATURE_DELETE,
      [],
    );
  }

  async getHomePageData(lang: string) {
    if (!lang) {
      lang = 'en';
    }
    const keyFeature = await this.staticKeyFeatureModel
      .find({ active: true })
      .sort({ orderIndex: 1 })
      .exec();
    const client = new MongoClient(process.env.MONGO_URL);
    const totalCompletedAssessment =
      await this.assessmentResponseModel.countDocuments();
    await client.connect();
    const db = client.db('ns-rewamp-backend');
    const collection = db.collection('userassessments');
    const userAssessments = await collection.find({}).toArray();

    // Count assessments with pending flag set to "no"
    const proCompletedAssessment = userAssessments.reduce((count, user) => {
      if (user.assessments && Array.isArray(user.assessments)) {
        const completed = user.assessments.filter(
          (assessment) => assessment.pending === 'no',
        );
        return count + completed.length;
      }
      return count;
    }, 0);
    const totalSubscriber = await this.subscriberModel.countDocuments();
    const totalVisitor = await this.subscriberActivityModel.countDocuments();
    const staticTestimonials = await this.staticTestimonialModel
      .find({ active: true })
      .sort({ orderIndex: 1 })
      .exec();
    const whatWeDo = await this.staticWhatWeDoModel
      .find({ active: true })
      .sort({ orderIndex: 1 })
      .exec();
    const result = {
      keyFeatures: keyFeature,
      totalSubscriber: totalSubscriber,
      totalVisitor: totalVisitor,
      totalAssessments: totalCompletedAssessment + proCompletedAssessment,
      staticTestimonials: staticTestimonials,
      whatWeDo: whatWeDo,
    };
    return this.baseResponse.sendResponse(
      200,
      'Home page data fetched successfully',
      result,
    );
  }
}
