import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { leaderBoardLevelDocument } from 'src/leader-board/entities/leader-board-level.entity';
import { MasterCmDocument } from 'src/master-cms/entities/master-cm.entity';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { AppConfigDocument } from './entities/app-config.entity';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectModel('AppConfig')
    private readonly appConfigModel: Model<AppConfigDocument>,
    @InjectModel('leaderBoardLevel')
    private readonly leaderBoardLevelModel: Model<leaderBoardLevelDocument>,
    @InjectModel('MasterCm')
    private readonly masterCmsModel: Model<MasterCmDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => LanguageTranslation))
    private readonly languageTranslation: LanguageTranslation,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<AppConfigDocument> {
    console.log('inside find by property App Config----->');
    return this.appConfigModel.findOne({ [property]: value }).exec();
  }

  async create(createAppConfigDto: CreateAppConfigDto) {
    console.log('This action adds a new App Config');
    const newAppConfig = await this.appConfigModel.create(createAppConfigDto);
    return this.baseResponse.sendResponse(
      200,
      message.appConfig.APP_CONFIG_CREATED,
      newAppConfig,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all App Config');
    const query = await this.filterService.filter(paginationDto);

    return await paginate(this.appConfigModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Ap Config`);
    const getAppConfigById = await this.appConfigModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.appConfig.APP_CONFIG_LIST,
      getAppConfigById,
    );
  }

  async update(id: string, updateAppConfigDto: UpdateAppConfigDto) {
    console.log(`This action updates a #${id} App Config`);
    const updateDetails = await this.appConfigModel.findByIdAndUpdate(
      id,
      updateAppConfigDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.appConfig.APP_CONFIG_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} App Config`);
    await this.appConfigModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.appConfig.APP_CONFIG_DELETE,
      [],
    );
  }

  async getConfiguration(lang: string) {
    console.log(`This action returns general app config and language details`);
    if (!lang) {
      lang = 'en';
    }
    const appConfig = await this.appConfigModel.find();
    const translation = await Promise.all(
      appConfig.map(async (doc) => {
        const documentData = doc.toObject();
        const translatedFields =
          await this.languageTranslation.getAppConfigTranslatedFields(
            documentData,
            lang,
          );
        return {
          ...documentData,
          ...translatedFields,
        };
      }),
    );
    const appConfigs = {};
    translation.map((config) => {
      appConfigs[config.key] = config.value;
    });
    const leaderBoardInformation = await this.leaderBoardLevelModel.find();
    let masterCms;
    masterCms = await this.masterCmsModel.find().exec();
    masterCms = await Promise.all(
      masterCms.map(async (doc) => {
        const documentData = doc.toObject();
        const translatedFields =
          await this.languageTranslation.getMasterCmsTranslatedFields(
            documentData,
            lang,
          );
        return {
          ...documentData,
          ...translatedFields,
        };
      }),
    );
    const healthFacilityMapping = [
      {
        DMC: 'DMC',
        TRUNAT: 'TRUNAT',
        CBNAAT: 'CBNAAT',
        X_RAY: 'X Ray',
        ICTC: 'ICTC',
        LPA_Lab: 'LPA Lab',
        CONFIRMATION_CENTER: 'Confirmation Center',
        Tobacco_Cessation_clinic: 'Tobacco Cessation clinic',
        ANC_Clinic: 'ANC Clinic',
        Nutritional_Rehabilitation_centre: 'Nutritional Rehabilitation centre',
        De_addiction_centres: 'De Addiction Centres',
        ART_Centre: 'ART Centre',
        District_DRTB_Centre: 'District DRTB Centre',
        NODAL_DRTB_CENTER: 'Nodal DRTB Center',
        IRL: 'IRL',
        Pediatric_Care_Facility: 'Pediatric Care Facility',
      },
    ];
    const language = [
      {
        title: 'English',
        subTitle: 'English',
        code: 'en',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454407LangEng.png',
      },
      {
        title: 'हिन्दी',
        subTitle: 'Hindi',
        code: 'hi',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454349LangHindi.png',
      },
      {
        title: 'ગુજરાતી',
        subTitle: 'Gujarati',
        code: 'gu',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454349LangHindi.png',
      },
      {
        title: 'मराठी',
        subTitle: 'Marathi',
        code: 'mr',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454275LangMarathi.png',
      },
      {
        title: 'தமிழ்',
        subTitle: 'Tamil',
        code: 'ta',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'ਪੰਜਾਬੀ',
        subTitle: 'Punjabi',
        code: 'pa',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'ਪੰਜਾਬੀ',
        subTitle: 'Punjabi',
        code: 'pa',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'తెలుగు',
        subTitle: 'Telugu',
        code: 'te',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'ಕನ್ನಡ',
        subTitle: 'Kannada',
        code: 'kn',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
    ];
    const result = {
      healthFacilityMapping: healthFacilityMapping,
      appTranslations: appConfigs,
      masterCms: masterCms,
      language: language,
      leaderBoardInformation: leaderBoardInformation,
    };
    return this.baseResponse.sendResponse(200, 'App Config Data!!', result);
  }

  async getLangCode() {
    console.log(`This Action return language code to AI`);
    const language = [
      {
        title: 'English',
        subTitle: 'English',
        code: 'en',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454407LangEng.png',
      },
      {
        title: 'हिन्दी',
        subTitle: 'Hindi',
        code: 'hi',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454349LangHindi.png',
      },
      {
        title: 'ગુજરાતી',
        subTitle: 'Gujarati',
        code: 'gu',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454349LangHindi.png',
      },
      {
        title: 'मराठी',
        subTitle: 'Marathi',
        code: 'mr',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674454275LangMarathi.png',
      },
      {
        title: 'தமிழ்',
        subTitle: 'Tamil',
        code: 'ta',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'ਪੰਜਾਬੀ',
        subTitle: 'Punjabi',
        code: 'pa',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'ਪੰਜਾਬੀ',
        subTitle: 'Punjabi',
        code: 'pa',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'తెలుగు',
        subTitle: 'Telugu',
        code: 'te',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
      {
        title: 'ಕನ್ನಡ',
        subTitle: 'Kannada',
        code: 'kn',
        imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
      },
    ];
    return this.baseResponse.sendResponse(200, 'language list', language);
  }
}
