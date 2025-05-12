import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { leaderBoardLevelSchema } from 'src/leader-board/entities/leader-board-level.entity';
import { MasterCmSchema } from 'src/master-cms/entities/master-cm.entity';
import { RolesModule } from 'src/roles/roles.module';
import { AppConfigController } from './app-config.controller';
import { AppConfigService } from './app-config.service';
import { AppConfigSchema } from './entities/app-config.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AppConfig', schema: AppConfigSchema }]),
    forwardRef(() => RolesModule),
    MongooseModule.forFeature([{ name: 'MasterCm', schema: MasterCmSchema }]),
    MongooseModule.forFeature([
      { name: 'leaderBoardLevel', schema: leaderBoardLevelSchema },
    ]),
  ],
  controllers: [AppConfigController],
  providers: [
    AppConfigService,
    FilterService,
    BaseResponse,
    LanguageTranslation,
  ],
  exports: [AppConfigService],
})
export class AppConfigModule {}
