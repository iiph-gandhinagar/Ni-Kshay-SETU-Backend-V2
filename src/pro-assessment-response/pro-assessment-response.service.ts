import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { stringify } from 'csv-stringify';
import mongoose, { Model } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { ProAssessmentAggregate } from 'src/common/pagination/proAssessmentAggregation.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { ProAssessmentResponseDocument } from './entities/pro-assessment-response.entity';

@Injectable()
export class ProAssessmentResponseService {
  constructor(
    @InjectModel('ProAssessmentResponse')
    private readonly proAssessmentModel: Model<ProAssessmentResponseDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}
  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Pro assessment');
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      )
      .exec();
    if (!adminUser) {
      throw new HttpException('Admin User not found', HttpStatus.NOT_FOUND);
    }

    // safe to access adminUser.state now
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);

    return await ProAssessmentAggregate(
      this.proAssessmentModel,
      paginationDto,
      query,
    );
  }

  async proAssessmentCsv(paginationDto: PaginationDto, userId: string) {
    console.log(
      `This action returns all user pro assessment details without pagination`,
    );
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);
    const { state, district, cadre, country } = paginationDto;
    const assessmentResponse = [
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' }, // Convert userId array to an object
      {
        $lookup: {
          from: 'countries',
          localField: 'userId.countryId',
          foreignField: '_id',
          as: 'userId.country',
          pipeline: country
            ? [{ $match: { _id: new mongoose.Types.ObjectId(country) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'states',
          localField: 'userId.stateId',
          foreignField: '_id',
          as: 'userId.state',
          pipeline: state
            ? [{ $match: { _id: new mongoose.Types.ObjectId(state) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'cadres',
          localField: 'userId.cadreId',
          foreignField: '_id',
          as: 'userId.cadre',
          pipeline: cadre
            ? [{ $match: { _id: new mongoose.Types.ObjectId(cadre) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'userId.districtId',
          foreignField: '_id',
          as: 'userId.district',
          pipeline: district
            ? [{ $match: { _id: new mongoose.Types.ObjectId(district) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'blocks',
          localField: 'userId.blockId',
          foreignField: '_id',
          as: 'userId.block',
        },
      },
      { $match: query },
      {
        $project: {
          name: '$userId.name',
          phoneNo: '$userId.phoneNo',
          email: '$userId.email',
          country: {
            $ifNull: [{ $arrayElemAt: ['$userId.country.title', 0] }, ''],
          },
          state: {
            $ifNull: [{ $arrayElemAt: ['$userId.state.title', 0] }, ''],
          },
          cadre: {
            $ifNull: [{ $arrayElemAt: ['$userId.cadre.title', 0] }, ''],
          },
          district: {
            $ifNull: [{ $arrayElemAt: ['$userId.district.title', 0] }, ''],
          },
          block: {
            $ifNull: [{ $arrayElemAt: ['$userId.block.title', 0] }, ''],
          },

          assessmentId: 1,
          assessmentTitle: 1,
          totalMarks: 1,
          obtainedMarks: 1,
          attempted: 1,
          rightAnswer: 1,
          wrongAnswer: 1,
          skip: 1,
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M:%S', // Custom date format
              date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
              timezone: 'Asia/Kolkata',
            },
          },
          percentage: {
            $cond: {
              if: { $gt: ['$totalMarks', 0] }, // Avoid division by zero
              then: {
                $multiply: [
                  { $divide: ['$obtainedMarks', '$totalMarks'] },
                  100,
                ],
              },
              else: 0, // Default to 0% if totalMarks is 0
            },
          },
        },
      },
    ];
    const nonNullChecks: any = {};
    if (country) nonNullChecks['country'] = { $ne: null };
    if (state) nonNullChecks['state'] = { $ne: null };
    if (cadre) nonNullChecks['cadre'] = { $ne: null };
    if (district) nonNullChecks['district'] = { $ne: null };
    // Add the conditional non-null check match stage if there are any conditions
    if (Object.keys(nonNullChecks).length > 0) {
      assessmentResponse.push({ $match: nonNullChecks });
    }
    const result = await this.proAssessmentModel
      .aggregate(assessmentResponse)
      .exec();

    return this.baseResponse.sendResponse(
      200,
      'Pro Assessment Result Fetched Successfully',
      result,
    );
  }

  async generateCsv(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      stringify(
        data,
        {
          header: true, // Include column headers
          columns: [
            { key: 'name', header: 'Name' },
            { key: 'phoneNo', header: 'Phone Number' },
            { key: 'email', header: 'Email' },
            { key: 'country', header: 'Country' },
            { key: 'state', header: 'State' },
            { key: 'cadre', header: 'Cadre' },
            { key: 'district', header: 'District' },
            { key: 'block', header: 'Block' },
            { key: 'assessmentTitle', header: 'Assessment Title' },
            { key: 'totalMarks', header: 'Total Marks' },
            { key: 'obtainedMarks', header: 'Obtained Marks' },
            { key: 'attempted', header: 'Attempted Questions' },
            { key: 'rightAnswer', header: 'Right Answers' },
            { key: 'wrongAnswer', header: 'Wrong Answers' },
            { key: 'skip', header: 'Skipped Questions' },
            { key: 'createdAt', header: 'Created At' },
            { key: 'percentage', header: 'Percentage' },
          ],
        },
        (err, output) => {
          if (err) {
            return reject(err);
          }
          resolve(output);
        },
      );
    });
  }
}
