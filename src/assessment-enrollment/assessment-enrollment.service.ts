import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { UpdateAssessmentEnrollmentDto } from './dto/update-assessment-enrollment.dto';
import { AssessmentEnrollmentDocument } from './entities/assessment-enrollment.entity';

@Injectable()
export class AssessmentEnrollmentService {
  constructor(
    @InjectModel('AssessmentEnrollment')
    private readonly assessmentEnrollmentModel: Model<AssessmentEnrollmentDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Assessment Enrollment');
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.assessmentEnrollmentModel,
      paginationDto,
      [],
      query,
    );
  }

  async update(
    id: string,
    updateAssessmentEnrollmentDto: UpdateAssessmentEnrollmentDto,
  ) {
    console.log(`This action updates a #${id} Assessment`);
    if (updateAssessmentEnrollmentDto.assessmentId) {
      updateAssessmentEnrollmentDto.assessmentId = new mongoose.Types.ObjectId(
        updateAssessmentEnrollmentDto.assessmentId,
      );
    }
    if (updateAssessmentEnrollmentDto.userId) {
      updateAssessmentEnrollmentDto.userId = new mongoose.Types.ObjectId(
        updateAssessmentEnrollmentDto.userId,
      );
    }
    const updateDetails =
      await this.assessmentEnrollmentModel.findByIdAndUpdate(
        id,
        updateAssessmentEnrollmentDto,
        { new: true },
      );
    return this.baseResponse.sendResponse(
      200,
      message.assessmentEnrollment.ASSESSMENT_ENROLLMENT_UPDATED,
      updateDetails,
    );
  }
}
