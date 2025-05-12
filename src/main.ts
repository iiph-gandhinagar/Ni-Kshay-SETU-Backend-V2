import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as dotenv from 'dotenv';
import expressBasicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/assets/httpExceptionFilter';
import { SchedulerService } from './scheduler/scheduler.service';
dotenv.config();

async function bootstrap() {
  // Check if a cron task is specified in the command-line arguments
  const task = process.argv[2]; // e.g., "node dist/main.js <task-name>"

  if (task) {
    // Run a specific cron task and exit
    const app = await NestFactory.createApplicationContext(AppModule); // Context without starting the server
    const schedulerService = app.get(SchedulerService);
    try {
      switch (task) {
        case 'handleCron':
          await schedulerService.handleCron();
          break;
        case 'closeStaleQueries':
          await schedulerService.closeStaleQueries();
          break;
        case 'updateAssessmentScore':
          await schedulerService.updateAssessmentScore();
          break;
        case 'handle5DayInactivity':
          await schedulerService.handle5DayInactivity();
          break;
        case 'handle10DayInactivity':
          await schedulerService.handle10DayInactivity();
          break;
        case 'handle15DayInactivity':
          await schedulerService.handle15DayInactivity();
          break;
        case 'handleLeaderBoardDownFall':
          await schedulerService.handleLeaderBoardDownFall();
          break;
        case 'handleLeaderBoardPendingBadge':
          await schedulerService.handleLeaderBoardPendingBadge();
          break;
        case 'handleNewProAssessment':
          await schedulerService.handleNewProAssessment();
          break;
        case 'handlePendingProAssessment':
          await schedulerService.handlePendingProAssessment();
          break;
        case 'handleLeaderBoardUpdate':
          await schedulerService.handleLeaderBoardUpdate();
          break;
        case 'sendForgotOtp':
          await schedulerService.sendForgotOtp();
          break;
        case 'handleThirdPartyApi':
          await schedulerService.handleThirdPartyApi();
          break;
        default:
          process.exit(1);
      }
    } catch (error) {
      process.exit(1);
    } finally {
      await app.close();
    }

    process.exit(0); // Exit after the task completes
  } else {
    const app = await NestFactory.create(AppModule);
    app.use(
      '/api/docs', // Swagger route path
      expressBasicAuth({
        users: { admin: 'asd@1234' }, // Define username and password
        challenge: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    /* Enable Cors section (add URLs) */
    app.enableCors({
      origin: [], // define which domains can access your API
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Allowed methods
      credentials: true, // Allow cookies to be sent
      allowedHeaders: [
        'Content-Type',
        'Accept',
        'ngrok-skip-browser-warning',
        'Authorization',
        'lang',
      ], // Allowed headers
    });
    /* Swagger Documentation */
    const config = new DocumentBuilder()
      .setTitle('Nikshay-setu API')
      .setDescription('Admin Panel APIs')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    /* Set global prefix for all routes */
    app.setGlobalPrefix('api/');
    if (process.env.IS_PRIMARY_ZONE && process.env.IS_PRIMARY_ZONE == 'true') {
    }
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    /* Listen Port on */
    await app.listen(process.env.PORT);
  }
}
bootstrap();
