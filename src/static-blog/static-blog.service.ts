import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateStaticBlogDto } from './dto/create-static-blog.dto';
import { UpdateStaticBlogDto } from './dto/update-static-blog.dto';
import { StaticBlogDocument } from './entities/static-blog.entity';

@Injectable()
export class StaticBlogService {
  constructor(
    @InjectModel('StaticBlog')
    private readonly staticBlogModel: Model<StaticBlogDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<StaticBlogDocument> {
    console.log('inside find by property Blog----->');
    return this.staticBlogModel.findOne({ [property]: value }).exec();
  }

  async create(createStaticBlogDto: CreateStaticBlogDto) {
    console.log('This action adds a new Blog');
    createStaticBlogDto.slug = createStaticBlogDto.title['en']
      .trim() // Remove leading and trailing spaces
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, '');
    const newStaticBlog =
      await this.staticBlogModel.create(createStaticBlogDto);
    return this.baseResponse.sendResponse(
      200,
      message.staticBlog.STATIC_BLOG_CREATED,
      newStaticBlog,
    );
  }

  async findAll(paginationDto: PaginationDto, lang: string) {
    console.log('This action returns all Blog');
    if (!lang) {
      lang = 'en';
    }
    paginationDto.active = 'true';
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticBlogModel, paginationDto, [], query);
  }

  async findAllBlogs(paginationDto: PaginationDto, lang: string) {
    console.log('This action returns all Blog');
    if (!lang) {
      lang = 'en';
    }
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.staticBlogModel, paginationDto, [], query);
  }

  async getBlogBySlug(slug: string, lang: string) {
    console.log(`This action returns a #${slug} Blog`);
    if (!lang) {
      lang = 'en';
    }
    const getBlogById = await this.staticBlogModel
      .findOne({ slug: slug })
      .lean(true);
    return this.baseResponse.sendResponse(
      200,
      message.staticBlog.STATIC_BLOG_LIST,
      getBlogById,
    );
  }

  async getSimilarBlogs(slug: string) {
    const blogKeywords = await this.staticBlogModel
      .findOne({ slug: new RegExp(slug, 'i') })
      .select('keywords');
    if (blogKeywords && blogKeywords.keywords) {
      const regexArray = blogKeywords.keywords.map(
        (keyword) => new RegExp(keyword, 'i'),
      ); // Create regex for each keyword

      const blogs = await this.staticBlogModel
        .find({
          slug: { $ne: slug },
          keywords: { $in: regexArray }, // Use $in with regex array
          active: true,
        })
        .select(
          'id title shortDescription author source orderIndex keywords createdAt slug',
        )
        .lean(true); // Adjust if media is a referenced schema
      return this.baseResponse.sendResponse(
        200,
        message.staticBlog.STATIC_BLOG_LIST,
        blogs,
      );
    }
    return this.baseResponse.sendResponse(
      200,
      message.staticBlog.STATIC_BLOG_LIST,
      [],
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Blog`);
    const getBlogById = await this.staticBlogModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticBlog.STATIC_BLOG_LIST,
      getBlogById,
    );
  }

  async update(id: string, updateStaticBlogDto: UpdateStaticBlogDto) {
    console.log(`This action updates a #${id} Blog`);
    if (updateStaticBlogDto.title) {
      updateStaticBlogDto.slug = updateStaticBlogDto.title['en']
        .trim() // Remove leading and trailing spaces
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w-]+/g, '');
    }
    const updateDetails = await this.staticBlogModel.findByIdAndUpdate(
      id,
      updateStaticBlogDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.staticBlog.STATIC_BLOG_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Blog`);
    await this.staticBlogModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.staticBlog.STATIC_BLOG_DELETE,
      [],
    );
  }
}
