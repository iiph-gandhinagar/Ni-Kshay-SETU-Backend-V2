import { CacheModule } from '@nestjs/cache-manager';
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';
import * as dotenv from 'dotenv';
import { AbbreviationModule } from './abbreviation/abbreviation.module';
import { AdminActivityModule } from './admin-activity/admin-activity.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AlgorithmCgcInterventionModule } from './algorithm-cgc-intervention/algorithm-cgc-intervention.module';
import { AlgorithmDiagnosisModule } from './algorithm-diagnosis/algorithm-diagnosis.module';
import { AlgorithmDifferentialCareModule } from './algorithm-differential-care/algorithm-differential-care.module';
import { AlgorithmGuidanceOnAdverseDrugReactionModule } from './algorithm-guidance-on-adverse-drug-reaction/algorithm-guidance-on-adverse-drug-reaction.module';
import { AlgorithmLatentTbInfectionModule } from './algorithm-latent-tb-infection/algorithm-latent-tb-infection.module';
import { AlgorithmTreatmentModule } from './algorithm-treatment/algorithm-treatment.module';
import { All3rdPartyApisResponseModule } from './all-3rd-party-apis-response/all-3rd-party-apis-response.module';
import { AppConfigModule } from './app-config/app-config.module';
import { AppManagementFlagModule } from './app-management-flag/app-management-flag.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssessmentCertificateModule } from './assessment-certificate/assessment-certificate.module';
import { AssessmentEnrollmentModule } from './assessment-enrollment/assessment-enrollment.module';
import { AssessmentResponseModule } from './assessment-response/assessment-response.module';
import { AssessmentResponseSchema } from './assessment-response/entities/assessment-response.entity';
import { AssessmentModule } from './assessment/assessment.module';
import { AutomaticNotificationModule } from './automatic-notification/automatic-notification.module';
import { BlockModule } from './block/block.module';
import { CadreModule } from './cadre/cadre.module';
import { ChatConversionModule } from './chat-conversion/chat-conversion.module';
import { IpBlockerGuard } from './common/decorators/ipBlockerGuard';
import { IsUniqueConstraint } from './common/decorators/unique.validator';
import { IsUniqueIgnoreConstraint } from './common/decorators/uniqueIgnoreId.validator';
import { BaseResponse } from './common/utils/baseResponse';
import { FirebaseModule } from './common/utils/firebase.module';
import { WatchTypeService } from './common/watchers/watch-type.service';
import { WatcherService } from './common/watchers/watchers.service';
import { CountryModule } from './country/country.module';
import { CronJobModule } from './cron-jobs/cron-job.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DeleteAccountCountModule } from './delete-account-count/delete-account-count.module';
import { DistrictModule } from './district/district.module';
import { DynamicAlgoMasterModule } from './dynamic-algo-master/dynamic-algo-master.module';
import { DynamicAlgorithmModule } from './dynamic-algorithm/dynamic-algorithm.module';
import { FeedbackHistoryModule } from './feedback-history/feedback-history.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FlashNewsModule } from './flash-news/flash-news.module';
import { FlashSimilarAppsModule } from './flash-similar-apps/flash-similar-apps.module';
import { HealthFacilityModule } from './health-facility/health-facility.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { InstituteModule } from './institute/institute.module';
import { IpBlockerModule } from './ipBlocker/ipBlocker.module';
import { PermissionsGuard } from './jwt/permission.guard';
import { KbaseModule } from './kbase/kbase.module';
import { leaderBoardBadgeSchema } from './leader-board/entities/leader-board-badge.entity';
import { leaderBoardLevelSchema } from './leader-board/entities/leader-board-level.entity';
import { leaderBoardTaskSchema } from './leader-board/entities/leader-board-task.entity';
import { LeaderBoardModule } from './leader-board/leader-board.module';
import { ManageTbModule } from './manage-tb/manage-tb.module';
import { MasterCmsModule } from './master-cms/master-cms.module';
import { MasterInstituteModule } from './master-institute/master-institute.module';
import { MessageNotificationModule } from './message-notification/message-notification.module';
import { OldAssessmentResultModule } from './old-assessment-result/old-assessment-result.module';
import { PdfModule } from './pdf/pdf.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PluginManagementModule } from './plugin-management/plugin-management.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { PrimaryCadreModule } from './primary-cadre/primary-cadre.module';
import { ProAssessmentResponseModule } from './pro-assessment-response/pro-assessment-response.module';
import { QueryModule } from './query/query.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { RegionModule } from './region/region.module';
import { ResourceMaterialModule } from './resource-material/resource-material.module';
import { RolesModule } from './roles/roles.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { ScreeningModule } from './screening/screening.module';
import { StateModule } from './state/state.module';
import { StaticAppConfigModule } from './static-app-config/static-app-config.module';
import { StaticBlogModule } from './static-blog/static-blog.module';
import { StaticEnquiryModule } from './static-enquiry/static-enquiry.module';
import { StaticFaqModule } from './static-faq/static-faq.module';
import { StaticKeyFeatureModule } from './static-key-feature/static-key-feature.module';
import { StaticModuleModule } from './static-module/static-module.module';
import { StaticReleaseModule } from './static-release/static-release.module';
import { StaticResourceMaterialModule } from './static-resource-material/static-resource-material.module';
import { StaticTestimonialModule } from './static-testimonial/static-testimonial.module';
import { StaticWhatWeDoModule } from './static-what-we-do/static-what-we-do.module';
import { SubscriberActivitySchema } from './subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberActivityModule } from './subscriber-activity/subscriber-activity.module';
import { SubscriberProgressSchema } from './subscriber-progress/entities/subscriber-progress-history';
import { SubscriberProgressModule } from './subscriber-progress/subscriber-progress.module';
import { SubscriberProgressService } from './subscriber-progress/subscriber-progress.service';
import { SubscriberSchema } from './subscriber/entities/subscriber.entity';
import { SubscriberModule } from './subscriber/subscriber.module';
import { SurveyHistoryModule } from './survey-history/survey-history.module';
import { SurveyMasterModule } from './survey-master/survey-master.module';
import { SymptomModule } from './symptom/symptom.module';
import { SystemQuestionModule } from './system-question/system-question.module';
import { TemporaryTokenModule } from './temporary-token/temporary-token.module';
import { TourModule } from './tour/tour.module';
import { UploadModule } from './upload/upload.module';
import { UserAppVersionModule } from './user-app-version/user-app-version.module';
import { UserDeviceTokenModule } from './user-device-token/user-device-token.module';
import { UserNotificationModule } from './user-notification/user-notification.module';
dotenv.config();
const { MONGO_URL }: any = process.env;
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(MONGO_URL, {
      serverSelectionTimeoutMS: 60000,
    }),
    CacheModule.register({
      store: redisStore,
      host: 'localhost', // Change if Redis is hosted elsewhere
      port: 6379,
      ttl: 600 * 1000, // Default TTL: 10 minutes
    }),
    MongooseModule.forFeature([
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
      { name: 'leaderBoardTask', schema: leaderBoardTaskSchema },
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'subscriberProgressHistory', schema: SubscriberProgressSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'leaderBoardBadge', schema: leaderBoardBadgeSchema },
      { name: 'leaderBoardLevel', schema: leaderBoardLevelSchema },
    ]),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 0,
          limit: 0,
        },
      ],
    }),
    IpBlockerModule,
    FirebaseModule,
    SchedulerModule,
    RolesModule,
    PermissionsModule,
    AdminUsersModule,
    StateModule,
    CountryModule,
    CadreModule,
    DistrictModule,
    BlockModule,
    SymptomModule,
    HealthFacilityModule,
    ResourceMaterialModule,
    AppConfigModule,
    AppManagementFlagModule,
    StaticBlogModule,
    StaticFaqModule,
    StaticAppConfigModule,
    StaticKeyFeatureModule,
    StaticTestimonialModule,
    StaticReleaseModule,
    StaticEnquiryModule,
    StaticWhatWeDoModule,
    StaticModuleModule,
    StaticResourceMaterialModule,
    TourModule,
    FlashSimilarAppsModule,
    SurveyMasterModule,
    SystemQuestionModule,
    ScreeningModule,
    SubscriberModule,
    UserDeviceTokenModule,
    RegionModule,
    AbbreviationModule,
    ChatConversionModule,
    PrimaryCadreModule,
    SurveyHistoryModule,
    ManageTbModule,
    InquiryModule,
    FeedbackModule,
    FeedbackHistoryModule,
    AlgorithmDiagnosisModule,
    AlgorithmTreatmentModule,
    AlgorithmGuidanceOnAdverseDrugReactionModule,
    AlgorithmLatentTbInfectionModule,
    AlgorithmDifferentialCareModule,
    AlgorithmCgcInterventionModule,
    KbaseModule,
    MasterInstituteModule,
    InstituteModule,
    QueryModule,
    QuestionBankModule,
    AssessmentModule,
    AssessmentEnrollmentModule,
    AssessmentResponseModule,
    AssessmentCertificateModule,
    PdfModule,
    UploadModule,
    SubscriberActivityModule,
    PluginManagementModule,
    LeaderBoardModule,
    AdminActivityModule,
    FlashNewsModule,
    UserAppVersionModule,
    MasterCmsModule,
    DynamicAlgoMasterModule,
    DynamicAlgorithmModule,
    UserNotificationModule,
    AutomaticNotificationModule,
    SchedulerModule,
    CronJobModule,
    SubscriberProgressModule,
    MessageNotificationModule,
    DashboardModule,
    DeleteAccountCountModule,
    TemporaryTokenModule,
    PrescriptionModule,
    All3rdPartyApisResponseModule,
    ProAssessmentResponseModule,
    OldAssessmentResultModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SchedulerService,
    IsUniqueConstraint,
    BaseResponse,
    IsUniqueIgnoreConstraint,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IpBlockerGuard,
    },
    WatcherService,
    WatchTypeService,
    SubscriberProgressService,
  ],
})
export class AppModule {}
