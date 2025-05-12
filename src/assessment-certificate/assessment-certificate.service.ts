import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { AssessmentDocument } from 'src/assessment/entities/assessment.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateAssessmentCertificateDto } from './dto/create-assessment-certificate.dto';
import { UpdateAssessmentCertificateDto } from './dto/update-assessment-certificate.dto';
import { AssessmentCertificateDocument } from './entities/assessment-certificate.entity';

@Injectable()
export class AssessmentCertificateService {
  constructor(
    @InjectModel('AssessmentCertificate')
    private readonly assessmentCertificateModel: Model<AssessmentCertificateDocument>,
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<AssessmentCertificateDocument> {
    console.log('inside find by property Assessment Certificate----->');
    return this.assessmentCertificateModel
      .findOne({ [property]: value })
      .exec();
  }

  async create(
    createAssessmentCertificateDto: CreateAssessmentCertificateDto,
    userId: string,
  ) {
    console.log('This action adds a new Assessment Certificate');
    createAssessmentCertificateDto.createdBy = new mongoose.Types.ObjectId(
      userId,
    );
    const newAssessment = await this.assessmentCertificateModel.create(
      createAssessmentCertificateDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.assessmentCertificate.ASSESSMENT_CERTIFICATE_CREATED,
      newAssessment,
    );
  }

  async findAllCertificate() {
    console.log(
      `This action return certificate list for drop down (assessment)`,
    );
    const getAssessmentCertificates =
      await this.assessmentCertificateModel.find();
    return this.baseResponse.sendResponse(
      200,
      message.assessmentCertificate.ASSESSMENT_CERTIFICATE_LIST,
      getAssessmentCertificates,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Assessment Certificate');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'createdBy', select: 'firstName lastName' },
    ];
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.assessmentCertificateModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Assessment`);
    const getAssessmentCertificateById =
      await this.assessmentCertificateModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.assessmentCertificate.ASSESSMENT_CERTIFICATE_LIST,
      getAssessmentCertificateById,
    );
  }

  async update(
    id: string,
    updateAssessmentCertificateDto: UpdateAssessmentCertificateDto,
  ) {
    console.log(`This action updates a #${id} Assessment Certificate`);
    const updateDetails =
      await this.assessmentCertificateModel.findByIdAndUpdate(
        id,
        updateAssessmentCertificateDto,
        { new: true },
      );
    return this.baseResponse.sendResponse(
      200,
      message.assessmentCertificate.ASSESSMENT_CERTIFICATE_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Assessment Certificate`);
    const assessment = await this.assessmentModel.findOne({
      certificateType: id,
    });
    if (assessment) {
      throw new HttpException(
        {
          message: "Can't Delete Certificate!!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.assessmentCertificateModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.assessmentCertificate.ASSESSMENT_CERTIFICATE_DELETE,
      [],
    );
  }
}
