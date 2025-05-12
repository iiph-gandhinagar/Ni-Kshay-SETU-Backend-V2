import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as Cheerio from 'cheerio';
import { Model } from 'mongoose';
import fetch from 'node-fetch';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateFlashNewDto } from './dto/create-flash-new.dto';
import { UpdateFlashNewDto } from './dto/update-flash-new.dto';
import { FlashNewsDocument } from './entities/flash-new.entity';

@Injectable()
export class FlashNewsService {
  constructor(
    @InjectModel('FlashNews')
    private readonly flashNewsModel: Model<FlashNewsDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<FlashNewsDocument> {
    console.log('inside find by property Flash News----->');
    return this.flashNewsModel.findOne({ [property]: value }).exec();
  }

  async create(createFlashNewDto: CreateFlashNewDto) {
    console.log('This action adds a new Flash News');
    const newFlashNews = await this.flashNewsModel.create(createFlashNewDto);
    return this.baseResponse.sendResponse(
      200,
      message.flashNews.FLASH_NEWS_CREATED,
      newFlashNews,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all District');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.flashNewsModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Flash News`);
    const getFlashNewsById = await this.flashNewsModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.flashNews.FLASH_NEWS_LIST,
      getFlashNewsById,
    );
  }

  async update(id: string, updateFlashNewDto: UpdateFlashNewDto) {
    console.log(`This action updates a #${id} Flash News`);
    const updateDetails = await this.flashNewsModel.findByIdAndUpdate(
      id,
      updateFlashNewDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.flashNews.FLASH_NEWS_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Flash News`);
    await this.flashNewsModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.flashNews.FLASH_NEWS_DELETE,
      [],
    );
  }

  async scrapeData() {
    console.log(`This action Scrape data for Flash News`);
    try {
      const headers = {
        Cookie: '__cfruid=50d1756983e6105f98ddb357cdf9059a2d747a2c-1666933110',
        'Cache-Control': 'no-cache',
        Host: 'nikshay.zendesk.com',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', // will be forced using 'Symfony BrowserKit' in executing
        'Postman-Token': '7603f851e0c085c6-BOM',
      };

      // Fetch the webpage
      const response = await fetch(
        'https://nikshay.zendesk.com/hc/en-us/categories/360002770891-New-Releases',
        { headers },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const html = await response.text();

      console.log(html);
      let $ = Cheerio.load(html);
      const dataCollection = [];

      $(
        '.category-container .category-content .section-tree .article-list-item',
      ).each((index, element) => {
        const text = $(element).text();
        const link = $(element).find('a').attr('href'); // Changed filter to find
        console.log('link', link);
        dataCollection.push({ data: text, link });
      });

      console.log('before for loop --->', dataCollection.length);

      for (const item of dataCollection) {
        const titleParts = item.data.split('( Release Date :');
        const title = titleParts[0].trim();
        const publishDate = titleParts[1]?.replace(' )', '').trim();

        console.log('checking news with title:');
        const newsExists = await this.flashNewsModel
          .find({
            href: {
              $regex: `https://nikshay.zendesk.com${item.link}`,
              $options: 'i',
            },
          })
          .exec();

        console.log('existing news count:', newsExists.length);
        if (newsExists.length === 0) {
          const newFlashNews = new this.flashNewsModel({
            title,
            href: `https://nikshay.zendesk.com${item.link}`,
            source:
              'https://nikshay.zendesk.com/hc/en-us/categories/360002770891-New-Releases',
            publish_date: publishDate,
          });
          await newFlashNews.save();
          console.log(`Saved new flash news:`);
        }
      }
      /*  Second Website content ---------------------------------------------------------------------------------------- */

      const response1 = await axios.get(
        'https://www.who.int/publications/i/item/9789240037021',
        // { headers },
      );
      // console.log('Fetched website data.', response1);
      if (response1.status !== 200) {
        throw new Error(`Request failed with status code ${response1.status}`);
      }
      $ = Cheerio.load(response1.data);
      const title = 'Global tuberculosis report 2021';
      const href = 'https://www.who.int/publications/i/item/9789240037021';
      const source = href;
      let publishDate = '';
      $('.dynamic-content__data .dynamic-content__date').each(
        (index, element) => {
          publishDate += $(element).text().trim() + ' ';
        },
      );
      publishDate = publishDate.trim();
      let description = '';
      $('.dynamic-content__description-container').each((index, element) => {
        description += $(element).text().trim() + ' ';
      });
      description = description.trim();
      // console.log('Description:', description);
      const recordExists = await this.flashNewsModel.countDocuments({
        title: { $regex: title, $options: 'i' },
      });

      if (recordExists === 0) {
        const newFlashNews = new this.flashNewsModel({
          title,
          href,
          source,
          publishDate,
          description,
        });

        await newFlashNews.save();
        console.log(`Saved new flash news: ${title}`);
      } else {
        console.log('Flash news already exists.');
      }
      /*  Third Website content -------------------------------------------------------------------------------------------------------------- */
      const response2 = await axios.get(
        'https://www.who.int/teams/global-tuberculosis-programme/tb-reports',
        // { headers },
      );
      // console.log('Fetched website data.', response2);
      if (response2.status !== 200) {
        throw new Error(`Request failed with status code ${response2.status}`);
      }
      $ = Cheerio.load(response2.data);

      /*  Title fetch -------------------------------> */
      let dynamicTitle = '';
      $('.sf-publications-wide__header .sf-publications-wide__title').each(
        (index, element) => {
          dynamicTitle += $(element).text().trim() + ' ';
        },
      );
      dynamicTitle = dynamicTitle.trim();
      // console.log('dynamicTitle --->', dynamicTitle);
      /*  HREF fetch =------------------------------------> */
      let dynamicHref = '';
      $('.sf-publications-wide__body .sf-publications-wide__header a').each(
        (index, element) => {
          dynamicHref += $(element).attr('href') + ' ';
        },
      );
      dynamicHref = dynamicHref.trim();

      /* Source Fetch -------------------------------------> */
      const dynamicSource =
        'https://www.who.int/teams/global-tuberculosis-programme/tb-reports';

      /* Publish Date Fetch --------------------------------> */
      let date = '';
      $('.sf-publications-wide__date').each((index, element) => {
        date += $(element).text().trim() + ' ';
      });
      date = date.trim();

      /* Description fetch --------------------------------------> */
      let description1 = '';
      $('.sf-publications-wide__body .sf-publications-wide__description').each(
        (index, element) => {
          description1 += $(element).text().trim() + ' ';
        },
      );
      description1 = description1.trim();

      const recordExists1 = await this.flashNewsModel.countDocuments({
        dynamicSource: { $regex: dynamicSource, $options: 'i' },
      });

      if (recordExists1 === 0) {
        const newFlashNews = new this.flashNewsModel({
          title: dynamicTitle,
          href: `https://www.who.int/${dynamicHref}`,
          source: dynamicSource,
          publishDate: date,
          description: description1,
        });

        await newFlashNews.save();
        console.log(`Saved new flash news: ${title}`);
      } else {
        console.log('Flash news already exists.');
      }

      /* fourth Website content -----------------------------------------------------------------------> */
      const response3 = await axios.get(
        'https://www.who.int/news-room/fact-sheets/detail/tuberculosis',
        // { headers },
      );
      // console.log('Fetched website data.', response3);
      if (response3.status !== 200) {
        throw new Error(`Request failed with status code ${response3.status}`);
      }
      $ = Cheerio.load(response3.data);
      let publishDate4 = '';
      $('.date .timestamp').each((index, element) => {
        publishDate4 += $(element).text().trim() + ' ';
      });
      publishDate4 = publishDate4.trim();
      let description4 = '';
      $('.sf-detail-content .sf-detail-body-wrapper').each((index, element) => {
        description4 += $(element).text().trim() + ' ';
      });
      description4 = description4.trim();
      // console.log('Description:', description4);
      const recordExists2 = await this.flashNewsModel.countDocuments({
        title: 'Tuberculosis',
      });
      console.log('length of record exist -->', recordExists2);
      if (recordExists2 === 0) {
        const newFlashNews = new this.flashNewsModel({
          title: 'Tuberculosis',
          href: 'https://www.who.int/news-room/fact-sheets/detail/tuberculosis',
          source:
            'https://www.who.int/news-room/fact-sheets/detail/tuberculosis',
          publishDate: publishDate4,
          description: description4,
        });

        await newFlashNews.save();
        console.log(`Saved new flash news: ${title}`);
      } else {
        console.log('Flash news already exists.');
      }

      /* Fifth Website content ------------------------------------------------------------------> */
      const response4 = await axios.get(
        'https://who.tuberculosis.recmap.org/api/recommendations-by-modules',
      );
      const finalJson = response4.data;
      const whoWebsiteContent = finalJson.modules;

      // Iterate over the content
      for (const content of whoWebsiteContent) {
        for (const data of content.submodules) {
          for (const recommendation of data.recommendations) {
            const title = recommendation.population[0]?.description;
            const description = recommendation.recommendation;
            const href = `https://who.tuberculosis.recmap.org/recommendation/${recommendation['@id']}`;
            const source = 'https://tbksp.org/en/recommendation/page-1';

            // Check if the record already exists
            const recordExists = await this.flashNewsModel
              .findOne({ title })
              .exec();

            if (!recordExists) {
              const newFlashNews = new this.flashNewsModel({
                title,
                description,
                href,
                source,
              });
              await newFlashNews.save();
              console.log(`Saved new flash news: ${title}`);
            } else {
              console.log(`Record already exists: ${title}`);
            }
          }
        }
      }
    } catch (error) {
      // Something happened in setting up the request
      console.log('Error in setting up the request:', error.message);
      return error.message;
    }
  }
}
