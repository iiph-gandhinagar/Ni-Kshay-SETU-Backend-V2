import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { PrimaryCadreSchema } from './entities/primary-cadre.entity';
import { PrimaryCadreController } from './primary-cadre.controller';
import { PrimaryCadreService } from './primary-cadre.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PrimaryCadre', schema: PrimaryCadreSchema },
      { name: 'Cadre', schema: CadreSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [PrimaryCadreController],
  providers: [PrimaryCadreService, FilterService, BaseResponse],
  exports: [PrimaryCadreService],
})
export class PrimaryCadreModule {}
