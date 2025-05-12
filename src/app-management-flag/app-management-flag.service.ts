import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateAppManagementFlagDto } from './dto/create-app-management-flag.dto';
import { UpdateAppManagementFlagDto } from './dto/update-app-management-flag.dto';
import { AppManagementDocument } from './entities/app-management-flag.entity';

@Injectable()
export class AppManagementFlagService {
  constructor(
    @InjectModel('AppManagementFlag')
    private readonly appManagementModel: Model<AppManagementDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<AppManagementDocument> {
    console.log('inside find by property App Management----->');
    return this.appManagementModel.findOne({ [property]: value }).exec();
  }

  async create(createAppManagementFlagDto: CreateAppManagementFlagDto) {
    console.log('This action adds a new App Management');
    const newAppManagement = await this.appManagementModel.create(
      createAppManagementFlagDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.appManagement.APP_MANAGEMENT_CREATED,
      newAppManagement,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all App Management');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.appManagementModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} App Management`);
    const getAppManagementById = await this.appManagementModel
      .findById(id)
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.appManagement.APP_MANAGEMENT_LIST,
      getAppManagementById,
    );
  }

  async update(
    id: string,
    updateAppManagementFlagDto: UpdateAppManagementFlagDto,
  ) {
    console.log(`This action updates a #${id} App Management`);
    const updateDetails = await this.appManagementModel
      .findByIdAndUpdate(id, updateAppManagementFlagDto, { new: true })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.appManagement.APP_MANAGEMENT_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} App Management`);
    await this.appManagementModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.appManagement.APP_MANAGEMENT_DELETE,
      [],
    );
  }

  async getCheckHealthStatus(
    lang: string,
    appVersion: string,
    platform: string,
  ) {
    console.log(
      `This action return App Version and strict version changes message`,
    );
    console.log('userId lang platform', parseFloat(appVersion), lang, platform);
    if (lang == null) {
      lang = 'en';
    }
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base',
    });

    const maintenance = await this.appManagementModel.findOne({
      variable: 'IS_IN_MAINTENANCE',
      'value.en': 'true', // Assuming the value is in JSON
    });
    const androidLatestVersion = await this.appManagementModel
      .findOne({ variable: 'ANDROID_APP_LATEST_VERSION' })
      .select('value.en')
      .exec();

    const androidMinimumVersion = await this.appManagementModel
      .findOne({
        variable: 'ANDROID_APP_MINIMUM_ALLOWED_VERSION',
      })
      .select('value.en')
      .exec();

    const appleLatestAppVersion = await this.appManagementModel
      .findOne({
        variable: 'IPHONE_APP_LATEST_VERSION',
      })
      .select('value.en')
      .exec();

    const appleMinimumAppVersion = await this.appManagementModel
      .findOne({
        variable: 'IPHONE_APP_MINIMUM_ALLOWED_VERSION',
      })
      .select('value.en')
      .exec();
    console.log('appleMinimumAppVersion -->', appleMinimumAppVersion);
    console.log(
      'android Minium App version -->',
      Number(androidMinimumVersion.value['en']),
    );
    console.log(
      'true of false ---<',
      parseFloat(appVersion) < parseFloat(androidMinimumVersion.value['en']),
    );
    const androidLatestAppVersionFeatures = await this.appManagementModel
      .findOne({
        variable: 'ANDROID_APP_LATEST_VERSION_FEATURES',
      })
      .select('value.en')
      .exec();

    const androidLatestAppVersionSize = await this.appManagementModel
      .findOne({
        variable: 'ANDROID_APP_LATEST_VERSION_SIZE',
      })
      .select('value.en')
      .exec();
    const generalInfo = await this.appManagementModel
      .findOne({
        variable: 'GENERAL',
        [`value.${lang}`]: { $ne: '' }, // Assuming the value has dynamic language properties
      })
      .select('value.en')
      .exec();
    console.log('androidLatestAppVersion', androidLatestVersion);
    let errorMsg, data;
    if (
      platform === 'mobile-app' ||
      platform === 'postman' ||
      platform === 'iPhone-app' ||
      platform === 'app'
    ) {
      if (maintenance) {
        if (lang == 'en') {
          errorMsg = 'Maintenance Error';
        } else if (lang == 'hi') {
          errorMsg = 'रखरखाव त्रुटि';
        } else if (lang == 'gu') {
          errorMsg = 'જાળવણી ભૂલ';
        } else {
          errorMsg = 'देखभाल त्रुटी';
        }
        const message = await this.appManagementModel
          .findOne({ variable: 'MAINTENANCE_MESSAGE' })
          .select('value');
        data = {
          errorCode: 503,
          errorMessage: errorMsg,
          message: message.value,
          alertCategory: 'PLANNED_MAINTENANCE',
          severity: 'High',
        };
      } else if (
        /* parseFloat not working on 8.10 it is consider 8.1 */
        (platform === 'mobile-app' &&
          androidMinimumVersion?.value['en'] &&
          collator.compare(appVersion, androidMinimumVersion.value['en']) <
            0) ||
        (platform == 'iPhone-app' && // Fix capitalization here
          appleMinimumAppVersion?.value['en'] &&
          collator.compare(appVersion, appleMinimumAppVersion.value['en']) < 0)
      ) {
        if (lang == 'en') {
          errorMsg = 'Upgrade Required Error';
        } else if (lang == 'hi') {
          errorMsg = 'अपग्रेड आवश्यक त्रुटि';
        } else if (lang == 'gu') {
          errorMsg = 'અપગ્રેડ જરૂરી ભૂલ';
        } else {
          errorMsg = 'अपग्रेड आवश्यक त्रुटी';
        }
        const message = await this.appManagementModel
          .findOne({ variable: 'ANDROID_APP_MINIMUM_ALLOWED_VERSION_MESSAGE' })
          .select('value');
        data = {
          errorCode: 426,
          errorMessage: errorMsg,
          message: message.value,
          alertCategory: 'APP_UPDATE',
          severity: 'High',
        };
      } else if (
        (platform === 'mobile-app' &&
          androidLatestVersion?.value['en'] &&
          collator.compare(appVersion, androidLatestVersion.value['en']) < 0) ||
        (platform == 'iPhone-app' && // Fix capitalization here
          appleLatestAppVersion?.value['en'] &&
          collator.compare(appVersion, appleLatestAppVersion.value['en']) < 0)
      ) {
        if (lang == 'en') {
          errorMsg = 'App Version Update Required';
        } else if (lang == 'hi') {
          errorMsg = 'अद्यतन ऐप संस्करण त्रुटि';
        } else if (lang == 'gu') {
          errorMsg = 'એપ્લિકેશન સંસ્કરણ અપડેટ કરવામાં ભૂલ';
        } else {
          errorMsg = 'अॅप आवृत्ती अपडेट आवश्यक आहे';
        }
        const message = await this.appManagementModel
          .findOne({ variable: 'ANDROID_APP_LATEST_VERSION_MESSAGE' })
          .select('value');
        data = {
          errorCode: 103,
          errorMessage: errorMsg,
          message: message.value,
          Update_size: androidLatestAppVersionSize.value,
          new_feature: androidLatestAppVersionFeatures.value,
          alertCategory: 'APP_UPDATE',
          severity: 'Low',
        };
      } else if (generalInfo) {
        if (lang == 'en') {
          errorMsg = 'World Tuberculosis Day';
        } else if (lang == 'hi') {
          errorMsg = 'विश्व टीबी दिवस';
        } else if (lang == 'gu') {
          errorMsg = 'વિશ્વ ટીબી દિવસ';
        } else {
          errorMsg = 'जागतिक क्षयरोग दिन';
        }
        data = {
          errorCode: 202,
          errorMessage: errorMsg,
          message: [{ value: generalInfo.value }],
          alertCategory: 'GERNERAL',
          severity: 'Low',
        };
      } else {
        data = {
          errorCode: 200,
          errorMessage: 'No Error',
          message: [{ value: '' }],
          alertCategory: 'UP_TO_DATE',
          severity: 'NA',
        };
      }
    } else if (platform == 'web') {
      if (maintenance) {
        if (lang == 'en') {
          errorMsg = 'Maintenance Error';
        } else if (lang == 'hi') {
          errorMsg = 'रखरखाव त्रुटि';
        } else if (lang == 'gu') {
          errorMsg = 'જાળવણી ભૂલ';
        } else {
          errorMsg = 'देखभाल त्रुटी';
        }

        const message = await this.appManagementModel
          .findOne({ variable: 'MAINTENANCE_MESSAGE' })
          .select('value');
        data = {
          errorCode: 503,
          errorMessage: errorMsg,
          message: message.value,
          alertCategory: 'PLANNED_MAINTENANCE',
          severity: 'High',
        };
      } else if (generalInfo) {
        if (lang == 'en') {
          errorMsg = 'World Tuberculosis Day';
        } else if (lang == 'hi') {
          errorMsg = 'विश्व टीबी दिवस';
        } else if (lang == 'gu') {
          errorMsg = 'વિશ્વ ટીબી દિવસ';
        } else {
          errorMsg = 'जागतिक क्षयरोग दिन';
        }
        data = {
          errorCode: 202,
          errorMessage: errorMsg,
          message: [{ value: generalInfo.value }],
          alertCategory: 'GERNERAL',
          severity: 'Low',
        };
      } else {
        data = {
          errorCode: 200,
          errorMessage: 'No Error',
          message: [{ value: '' }],
          alertCategory: 'UP_TO_DATE',
          severity: 'NA',
        };
      }
    }
    return this.baseResponse.sendResponse(200, 'Health Checks Data', data);
  }
}
