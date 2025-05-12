import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { AlgorithmDiagnosisDocument } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareDocument } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionDocument } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionDocument } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentDocument } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { AssessmentDocument } from 'src/assessment/entities/assessment.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { ResourceMaterialDocument } from 'src/resource-material/entities/resource-material.entity';
import { Role } from 'src/roles/entities/role.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { CreateUserNotificationDto } from './dto/create-user-notification.dto';
import { UserNotificationDocument } from './entities/user-notification.entity';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @InjectModel('AdminUser')
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('ResourceMaterial')
    private readonly resourceMaterialModel: Model<ResourceMaterialDocument>,
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDocument>,
    @InjectModel('AlgorithmDiagnosis')
    private readonly diagnosisModel: Model<AlgorithmDiagnosisDocument>,
    @InjectModel('AlgorithmTreatment')
    private readonly treatmentModel: Model<AlgorithmTreatmentDocument>,
    @InjectModel('AlgorithmLatentTbInfection')
    private readonly latentTBModel: Model<AlgorithmLatentTbInfectionDocument>,
    @InjectModel('AlgorithmGuidanceOnAdverseDrugReaction')
    private readonly guidanceOnADRModel: Model<AlgorithmGuidanceOnAdverseDrugReactionDocument>,
    @InjectModel('AlgorithmDifferentialCare')
    private readonly differentialCareCascadeModel: Model<AlgorithmDifferentialCareDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueueService: NotificationQueueService,
  ) {}
  async create(
    createUserNotificationDto: CreateUserNotificationDto,
    AdminUserId: string,
  ) {
    console.log('This action adds a new User notification');
    if (createUserNotificationDto.countryId) {
      createUserNotificationDto.countryId = new mongoose.Types.ObjectId(
        createUserNotificationDto.countryId,
      );
    }
    if (createUserNotificationDto.stateId) {
      createUserNotificationDto.stateId = createUserNotificationDto.stateId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    if (createUserNotificationDto.cadreId) {
      createUserNotificationDto.cadreId = createUserNotificationDto.cadreId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    if (createUserNotificationDto.districtId) {
      createUserNotificationDto.districtId =
        createUserNotificationDto.districtId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }

    let userIds;
    createUserNotificationDto.createdBy = new mongoose.Types.ObjectId(
      AdminUserId,
    );
    if (createUserNotificationDto.type == 'user-specific') {
      userIds = createUserNotificationDto.userId;
    } else if (createUserNotificationDto.type == 'multiple-filters') {
      let query = this.subscriberModel.find({
        cadreId: { $in: createUserNotificationDto.cadreId },
      });
      if (createUserNotificationDto.countryId != undefined) {
        query = query
          .where('countryId')
          .equals(createUserNotificationDto.countryId);
      } else if (createUserNotificationDto.districtId?.length > 0) {
        query = query
          .where('districtId')
          .in(createUserNotificationDto.districtId);
      } else {
        query = query.where('stateId').in(createUserNotificationDto.stateId);
      }
      const result = await query.select('_id').exec();
      userIds = result.map((subscriber) => subscriber._id);
    } else {
      // Fetch all subscriber IDs
      console.log('Go into public notification');
      const result = await this.subscriberModel.find().select('_id').exec();
      userIds = result.map((subscriber) => subscriber._id);
      createUserNotificationDto.isAllUser = true;
    }

    createUserNotificationDto.userId = userIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    /*  Deep-linking Conditions */
    let type, materialParentId, assessmentTitle, parentId;

    if (createUserNotificationDto.automaticNotificationType == 'Assessment') {
      assessmentTitle = await this.assessmentModel
        .findById(createUserNotificationDto.typeTitle['_id'])
        .select('title timeToComplete');
      createUserNotificationDto.assessmentTitle = assessmentTitle.title.en;
      createUserNotificationDto.timeToCompleted =
        assessmentTitle.timeToComplete;
      createUserNotificationDto.link = `${process.env.FRONTEND_URL}/currentAssessmentScreen`;
      type = 'assessment';
    } else if (
      createUserNotificationDto.automaticNotificationType == 'Resource Material'
    ) {
      materialParentId = await this.resourceMaterialModel
        .findById(createUserNotificationDto.typeTitle['_id'])
        .select('title typeOfMaterials parentId');
      createUserNotificationDto.link = `${process.env.FRONTEND_URL}/resourceMaterial/${materialParentId.title.en}/${materialParentId.parentId}`;
      type = 'resourceMaterial';
    } else if (
      createUserNotificationDto.automaticNotificationType ==
      'Diagnosis Algorithms'
    ) {
      parentId = await this.diagnosisModel
        .findById(createUserNotificationDto.typeTitle['_id'])
        .select('title parentId');
      if (parentId.parentId != null) {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmView/Diagnosis%20Algorithm/${parentId.parentId}`;
      } else {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmScreen/Diagnosis%20Algorithm`;
      }

      type = 'algorithm';
    } else if (
      createUserNotificationDto.automaticNotificationType ==
      'Treatment Algorithms'
    ) {
      parentId = await this.treatmentModel
        .findById(createUserNotificationDto.typeTitle['_id'])
        .select('title parentId');
      if (parentId.parentId != null) {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmView/Treatment%20Algorithm/${parentId.parentId}`;
      } else {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmScreen/Treatment%20Algorithm`;
      }
      type = 'algorithm';
    } else if (
      createUserNotificationDto.automaticNotificationType ==
      'Guidance On Adverse Drug Reactions'
    ) {
      parentId = await this.guidanceOnADRModel
        .findById(createUserNotificationDto.typeTitle['_id'])
        .select('title parentId');
      if (parentId.parentId != null) {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmView/Guidance%20on%20ADR/${parentId.parentId}`;
      } else {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmScreen/Guidance%20on%20ADR`;
      }
      type = 'algorithm';
    } else if (createUserNotificationDto.automaticNotificationType == 'PMTPT') {
      parentId = await this.latentTBModel
        .findById(createUserNotificationDto.typeTitle['_id'])
        .select('title parentId');
      if (parentId.parentId != null) {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmView/TB%20Preventive%20Treatment/${parentId.parentId}`;
      } else {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmScreen/TB%20Preventive%20Treatment`;
      }
      type = 'algorithm';
    } else if (
      createUserNotificationDto.automaticNotificationType ==
      'Differential Care Algorithms'
    ) {
      parentId = await this.differentialCareCascadeModel
        .findById(createUserNotificationDto.typeTitle['_id'])
        .select('title parentId');
      if (parentId.parentId != null) {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmView/Differentiated%20Care%20Of%20TB%20Patients/${parentId.parentId}`;
      } else {
        createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmScreen/Differentiated%20Care%20Of%20TB%20Patients`;
      }
      type = 'algorithm';
    } else if (
      createUserNotificationDto.automaticNotificationType == 'Dynamic Algorithm'
    ) {
      const title = createUserNotificationDto.typeTitle['title'];
      const id = createUserNotificationDto.typeTitle['_id'];
      createUserNotificationDto.link = `${process.env.FRONTEND_URL}/algorithmScreen/${title}/Dynamic/${id}`;
      type = 'algorithm';
    } else {
      createUserNotificationDto.link = `${process.env.FRONTEND_URL}/homeScreen`;
      type = 'general';
    }
    createUserNotificationDto.status = 'Pending';
    if (createUserNotificationDto.typeTitle) {
      createUserNotificationDto.typeTitle = new mongoose.Types.ObjectId(
        createUserNotificationDto.typeTitle['_id'],
      );
    }
    const deviceToken = await this.userDeviceTokenModel
      .find({
        userId: { $in: createUserNotificationDto.userId },
      })
      .select('notificationToken');
    let newUserNotification;
    if (
      createUserNotificationDto.type !== 'user-specific' &&
      createUserNotificationDto.type !== 'multiple-filters'
    ) {
      const { userId, ...filteredDto } = createUserNotificationDto;
      console.log('public notification user count -->', userId.length);
      newUserNotification = await new this.userNotificationModel(
        filteredDto,
      ).save();
    } else {
      newUserNotification = await this.userNotificationModel.create(
        createUserNotificationDto,
      );
    }

    const userNotification = newUserNotification;

    console.log('user notification -->', userNotification.link);

    const notificationId = userNotification._id;
    if (!notificationId) {
      throw new Error('No subscribers found for the given filters');
    }
    await this.notificationQueueService.addNotificationToQueue(
      notificationId.toString(),
      userNotification,
      deviceToken,
      type,
    );
    return this.baseResponse.sendResponse(
      200,
      message.userNotification.USER_NOTIFICATION_CREATED,
      userNotification,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all User Notification');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
      { path: 'stateId', select: 'title' }, // Populate stateId and select only the name field
      { path: 'cadreId', select: 'title' }, // Populate cadreId and select only the name field
      { path: 'districtId', select: 'title' }, // Populate DistrictId and select only the name field
      { path: 'createdBy', select: 'firstName lastName email' }, // Populate createdBy and select only the name field
      { path: 'userId', select: 'name phoneNo email' }, // Populate UserId and select only the name field
    ];
    const query = await this.filterService.filter(paginationDto);
    const user = await this.adminUserModel
      .findById(userId)
      .populate<{ role: Role }>({ path: 'role', select: 'name' })
      .select('role')
      .lean();
    if (user?.role?.name !== 'Admin') {
      query.createdBy = new mongoose.Types.ObjectId(userId);
    }

    return await paginate(
      this.userNotificationModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} User Notification`);
    const getUserNotificationById = await this.userNotificationModel
      .findById(id)
      .populate([
        { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
        { path: 'stateId', select: 'title' }, // Populate stateId and select only the name field
        { path: 'cadreId', select: 'title' }, // Populate cadreId and select only the name field
        { path: 'districtId', select: 'title' }, // Populate DistrictId and select only the name field
        { path: 'createdBy', select: 'firstName lastName email' }, // Populate DistrictId and select only the name field
        { path: 'userId', select: 'name phoneNo email' },
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.userNotification.USER_NOTIFICATION_LIST,
      getUserNotificationById,
    );
  }

  async updateOne(id: string, payload: object) {
    const updatedDetails = await this.userNotificationModel.findByIdAndUpdate(
      id,
      payload,
    );
    return updatedDetails;
  }

  async getUserNotification(paginationDto: PaginationDto, userId: string) {
    console.log(`This action returns Notification List`);
    let queries: any = {};
    queries = {
      $or: [
        { userId: { $in: [new mongoose.Types.ObjectId(userId)] } },
        { isAllUser: true },
      ],
    };
    return await paginate(
      this.userNotificationModel,
      paginationDto,
      [],
      queries,
    );
  }
}
