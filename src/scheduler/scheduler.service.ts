import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AssessmentResponseService } from 'src/assessment-response/assessment-response.service';
import { KbaseService } from 'src/kbase/kbase.service';
import { QueryService } from 'src/query/query.service';
import { SubscriberService } from 'src/subscriber/subscriber.service';
import { NotificationSchedulerService } from './notificationScheduler.service';

@Injectable()
export class SchedulerService {
  constructor(
    @Inject(forwardRef(() => QueryService))
    private readonly queryService: QueryService,
    @Inject(forwardRef(() => KbaseService))
    private readonly kbaseService: KbaseService,
    @Inject(forwardRef(() => AssessmentResponseService))
    private readonly assessmentResponseService: AssessmentResponseService,
    @Inject(forwardRef(() => SubscriberService))
    private readonly subscriberService: SubscriberService,
    @Inject(forwardRef(() => NotificationSchedulerService))
    private readonly notificationSchedulerService: NotificationSchedulerService,
  ) {}
  // This method will run every day at 7:00 AM
  // @Cron('0 7 * * *') // Adjust the cron expression as needed (this is set for 7:00 AM)
  async handleCron() {
    console.log('Scheduler running every day at 7:00 AM');
    await this.queryService.upFlowOfQuery();
    console.log('Scheduler Run Successfully');
  }

  // @Cron('0 8 * * *') // Runs at 8:00 AM daily, adjust the timing as needed
  async closeStaleQueries() {
    console.log(
      'Running scheduler to close queries that have not been responded to within 7 days.',
    );
    await this.queryService.closeOldQueries();
    console.log('Stale queries closed successfully.');
  }
  // This cron job will run every day at 9:00 AM
  // @Cron('0 9 * * *')
  // kbaseScript() {
  //   console.log('Cron job running every day at 9:00 AM');
  //   // Your business logic here
  //   // this.kbaseService.scriptForStructureData();
  // }

  // This cron job will run every minute
  // @Cron('* * * * *')
  async updateAssessmentScore() {
    console.log('Cron job running every Minute');
    await this.assessmentResponseService.getNotCalculatedAssessment();
  }

  // @Cron('* * * * *')
  async sendForgotOtp() {
    console.log('Cron job running every Minute');
    await this.subscriberService.sendForgotOtp();
  }

  // @Cron('0 10 * * *')
  async handle5DayInactivity() {
    console.log('Cron job running every day at 10:00 AM');
    const userIds =
      await this.notificationSchedulerService.findInactiveSubscribers(5, 9);
    await this.notificationSchedulerService.notifySubscribers(
      userIds,
      '5 to 9 days',
    );
  }

  // @Cron('15 10 * * *')
  async handle10DayInactivity() {
    console.log('Cron job running every day at 10:15 AM');
    const userIds =
      await this.notificationSchedulerService.findInactiveSubscribers(10, 14);
    await this.notificationSchedulerService.notifySubscribers(
      userIds,
      '10 to 14 days',
    );
  }

  // @Cron('20 10 * * *')
  async handle15DayInactivity() {
    console.log('Cron job running every day at 10:20 AM');
    const userIds =
      await this.notificationSchedulerService.findInactiveSubscribers(15);
    await this.notificationSchedulerService.notifySubscribers(
      userIds,
      '15 or more days',
    );
  }

  // @Cron('25 10 * * *')
  async handleLeaderBoardDownFall() {
    console.log('Cron job running every day at 10:25 AM');
    await this.notificationSchedulerService.leaderBoardRankDownFall();
  }

  // @Cron('30 10 * * *')
  async handleLeaderBoardPendingBadge() {
    console.log('Cron job running every day at 10:30 AM');
    await this.notificationSchedulerService.leaderBoardPendingBadge();
  }

  // @Cron('* * * * *')
  async handlePlannedAssessment() {
    console.log('Cron job running every Minute');
    await this.notificationSchedulerService.plannedAssessment();
  }

  // @Cron('0 4 * * 0')
  async handleNewProAssessment() {
    console.log('Cron job running every Minute');
    await this.notificationSchedulerService.notifyNewAssessmentDetails();
  }

  // @Cron('0 11 * * *')
  async handlePendingProAssessment() {
    console.log('Cron job running every Minute');
    await this.notificationSchedulerService.notifyPendingProAssessment();
  }

  // @Cron('*/5 * * * *') //
  async handleLeaderBoardUpdate() {
    console.log('Cron job running every 5 Minute');
    await this.notificationSchedulerService.leaderBoardBadgeUpdate();
  }

  // @Cron('* * * * *') //0 6 * * *
  async handleThirdPartyApi() {
    console.log('Cron job running 6:00 Am everyDay');
    await this.notificationSchedulerService.get3rdPartyApiResponse();
  }
}
