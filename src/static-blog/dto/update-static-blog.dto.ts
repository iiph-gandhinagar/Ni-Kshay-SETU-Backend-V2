import { PartialType } from '@nestjs/swagger';
import { CreateStaticBlogDto } from './create-static-blog.dto';

export class UpdateStaticBlogDto extends PartialType(CreateStaticBlogDto) {}
