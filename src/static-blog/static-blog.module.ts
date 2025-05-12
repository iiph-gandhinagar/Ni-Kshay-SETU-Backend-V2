import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticBlogSchema } from './entities/static-blog.entity';
import { StaticBlogController } from './static-blog.controller';
import { StaticBlogService } from './static-blog.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticBlog', schema: StaticBlogSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticBlogController],
  providers: [StaticBlogService, FilterService, BaseResponse],
  exports: [StaticBlogService],
})
export class StaticBlogModule {}
