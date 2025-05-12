import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as path from 'path';
import { AlgorithmDiagnosisDocument } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmTreatmentDocument } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { BlockDocument } from 'src/block/entities/block.entity';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { CountryDocument } from 'src/country/entities/country.entity';
import { DistrictDocument } from 'src/district/entities/district.entity';
import { HealthFacilityDocument } from 'src/health-facility/entities/health-facility.entity';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { SymptomDocument } from 'src/symptom/entities/symptom.entity';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { ScreeningDocument } from './entities/screening.entity';

@Injectable()
export class ScreeningService {
  constructor(
    @InjectModel('Screening')
    private readonly screeningModel: Model<ScreeningDocument>,
    @InjectModel('AlgorithmTreatment')
    private readonly treatmentAlgorithmModel: Model<AlgorithmTreatmentDocument>,
    @InjectModel('AlgorithmDiagnosis')
    private readonly algorithmDiagnosisModel: Model<AlgorithmDiagnosisDocument>,
    @InjectModel('Symptom')
    private readonly symptomModel: Model<SymptomDocument>,
    @InjectModel('Country')
    private readonly countryModel: Model<CountryDocument>,
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
    @InjectModel('District')
    private readonly districtModel: Model<DistrictDocument>,
    @InjectModel('Block')
    private readonly blockModel: Model<BlockDocument>,
    @InjectModel('HealthFacility')
    private readonly healthFacilityModel: Model<HealthFacilityDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async storeScreeningTool(createScreeningDto: CreateScreeningDto) {
    const { symptomSelected, height, weight, age } = createScreeningDto;
    console.log('symptoms selected --->', symptomSelected);
    let countOfPTB = 0;
    let countOfPETB = 0;
    for (const item of symptomSelected) {
      const category = await this.symptomModel
        .findById({ _id: item })
        .select('category')
        .exec();
      if (category['category'] === '1') {
        countOfPTB++;
      } else {
        countOfPETB++;
      }
    }

    /*  General Report ------------------------------------------ */
    const heightInMeter = height * 0.01;
    const heightCmsToMeterSquare = heightInMeter * heightInMeter;
    const desirableWeight = 21 * heightCmsToMeterSquare;
    const minimumAcceptableWeight = 18.5 * heightCmsToMeterSquare;
    const desirableWeightGain = desirableWeight - weight;
    const minimumWeightGainRequired = minimumAcceptableWeight - weight;
    const desirableDailyCaloricIntake = desirableWeight * 40;
    const desirableDailyProteinIntake = desirableWeight * 1.5;
    console.log(
      desirableWeightGain,
      minimumWeightGainRequired,
      desirableDailyCaloricIntake,
      desirableDailyProteinIntake,
    );

    /* tb symptoms check------------------------------------------- */
    let detectedTB = '';
    let nutritionTitle = 'Nutrition Outcome Details';
    let tbId;
    if (age > 14 && countOfPETB >= 1) {
      detectedTB = 'Presumptive Extra-Pulmonary TB';
      nutritionTitle = 'Presumptive Extra-Pulmonary TB';
      const diagnosisId = await this.algorithmDiagnosisModel.findOne({
        'title.en': new RegExp(nutritionTitle, 'i'),
      });
      tbId = diagnosisId._id;
    } else if (age > 14 && countOfPTB >= 2) {
      detectedTB = 'Presumptive Pulmonary TB';
      nutritionTitle = 'Presumptive Pulmonary TB';
      const diagnosisId = await this.algorithmDiagnosisModel.findOne({
        'title.en': new RegExp(nutritionTitle, 'i'),
      });
      tbId = diagnosisId._id;
    } else if (age <= 14 && countOfPETB >= 1) {
      detectedTB = 'Presumptive Extra-Pulmonary Pediatric TB';
      nutritionTitle = 'Presumptive Extra-Pulmonary Pediatric TB';
      const diagnosisId = await this.algorithmDiagnosisModel.findOne({
        'title.en': new RegExp('Presumptive Extra-Pulmonary TB', 'i'),
      });
      tbId = diagnosisId._id;
    } else if (age <= 14 && countOfPTB >= 2) {
      detectedTB = 'Presumptive Pulmonary Pediatric TB';
      nutritionTitle = 'Presumptive Pediatric TB';
      const diagnosisId = await this.algorithmDiagnosisModel.findOne({
        'title.en': new RegExp(nutritionTitle, 'i'),
      });
      tbId = diagnosisId._id;
    }
    /* bmi result---------------------------------------------------- */
    const userBmi = weight / (heightInMeter * heightInMeter);

    let BMI = '';
    let linking_BMI = '';

    if (userBmi >= 18.5 && userBmi <= 24.9) {
      BMI = 'Normal';
      linking_BMI = 'Normal';
    } else if (userBmi >= 25 && userBmi <= 29.9) {
      BMI = 'Overweight';
      linking_BMI = 'Overweight/Obese';
    } else if (userBmi >= 30) {
      BMI = 'Obese';
      linking_BMI = 'Overweight/Obese';
    } else if (userBmi >= 17.0 && userBmi <= 18.4) {
      BMI = 'Mild Underweight';
      linking_BMI = 'Mild and Moderate Underweight';
    } else if (userBmi >= 16.0 && userBmi <= 16.9) {
      BMI = 'Moderately Underweight';
      linking_BMI = 'Mild and Moderate Underweight';
    } else if (userBmi <= 14.0) {
      BMI = 'Extremely Underweight';
      linking_BMI = 'Extremely Underweight';
    } else if (userBmi <= 16.0) {
      BMI = 'Severely Underweight';
      linking_BMI = 'Severely Underweight';
    }
    console.log('linking BMI ---->', linking_BMI);
    const id = await this.treatmentAlgorithmModel
      .findOne({ 'title.en': linking_BMI })
      .select('_id');

    let treatmentId;
    if (id) {
      treatmentId = id._id;
    } else {
      const normalBMI = await this.treatmentAlgorithmModel
        .findOne({ 'title.en': 'Normal' }, { id: 1 })
        .exec();
      treatmentId = normalBMI._id;
    }

    // Prepare result object
    const result = {
      BMI,
      treatmentId,
      heightInMeter,
      currentWeight: weight,
      heightCmsToMeterSquare,
      desirableWeight,
      minimumAcceptableWeight,
      desirableWeightGain,
      minimumWeightGainRequired,
      desirableDailyCaloricIntake,
      desirableDailyProteinIntake,
      userBmi,
      isTb: false,
      detectedTb: '',
      nutritionTitle: 'Nutrition Outcome Details',
      tbId: tbId,
    };
    // Check for TB detection
    let isTb = false;
    let detectedTb = '';
    if (detectedTB !== '') {
      isTb = true;
      detectedTb = detectedTB;
    }

    result.isTb = isTb;
    result.detectedTb = detectedTb;
    result.nutritionTitle = nutritionTitle;
    result.tbId = tbId;

    // Save screening record
    const user = await this.subscriberModel.findOne({
      phoneNo: '9033828687',
    });
    console.log('user --->');
    const newRequest = {
      userId: user._id,
      age: age,
      weight: weight,
      height: height,
      symptomSelected: symptomSelected,
      isTb: isTb,
      symptomName: detectedTb,
    };
    await this.screeningModel.create(newRequest);
    return this.baseResponse.sendResponse(
      200,
      'Screening Tool Result!',
      result,
    );
  }

  async scriptForMigrationSQLToMONGo() {
    console.log('inside script for migration sql to mongo db');
    const fullPath = path.resolve(
      __dirname,
      '/home/digiflux/Documents/mysql tables/block.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const record of jsonData) {
      console.log('record ------>', record.country_id);
      const countryId = await this.countryModel.findOne({
        id: record.country_id,
      });
      const stateId = await this.stateModel.findOne({ id: record.state_id });

      const districtId = await this.districtModel.findOne({
        id: record.district_id,
      });
      if (districtId) {
        const result = {
          districtId: districtId._id,
          stateId: stateId._id,
          countryId: countryId._id,
          title: record.title,
          id: record.id,
        };
        await this.blockModel.insertMany([result]);
        console.log('insert data ---------->');
      }
    }

    return true;
  }

  async scriptForMigratingHealthFacility() {
    const fullPath = path.resolve(
      __dirname,
      '/home/digiflux/Documents/mysql tables/healthFacility.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    const BATCH_SIZE = 2000; // Define a suitable batch size
    let batch = [];

    for (const record of jsonData) {
      try {
        console.log('Processing record ID:', record.id);

        // Parallelize these find operations
        const [countryId, stateId, districtId, blockId] = await Promise.all([
          this.countryModel.findOne({ id: record.country_id }),
          this.stateModel.findOne({ id: record.state_id }),
          this.districtModel.findOne({ id: record.district_id }),
          this.blockModel.findOne({ id: record.block_id }),
        ]);

        if (districtId && stateId && countryId && blockId) {
          const result = {
            blockId: blockId._id,
            districtId: districtId._id,
            stateId: stateId._id,
            countryId: countryId._id,
            healthFacilityCode: record.health_facility_code,
            DMC: record.DMC,
            TRUNAT: record.TRUNAT,
            CBNAAT: record.CBNAAT,
            XRAY: record.X_RAY,
            ICTC: record.ICTC,
            LPALab: record.LPA_Lab,
            CONFIRMATIONCENTER: record.CONFIRMATION_CENTER,
            TobaccoCessationClinic: record.Tobacco_Cessation_clinic,
            ANCClinic: record.ANC_Clinic,
            NutritionalRehabilitationCentre:
              record.Nutritional_Rehabilitation_centre,
            DeAddictionCentres: record.De_addiction_centres,
            ARTCentre: record.ART_Centre,
            DistrictDRTBCentre: record.District_DRTB_Centre,
            NODALDRTBCENTER: record.NODAL_DRTB_CENTER,
            IRL: record.IRL,
            PediatricCareFacility: record.Pediatric_Care_Facility,
            longitude: record.longitude,
            latitude: record.latitude,
            id: record.id,
          };
          batch.push(result);
        } else {
          console.log('Missing ID for record:', record.id);
        }

        // If the batch size is reached, insert and reset the batch
        if (batch.length >= BATCH_SIZE) {
          await this.healthFacilityModel.insertMany(batch);
          console.log(`Inserted batch of ${batch.length} records`);
          batch = [];
        }
      } catch (error) {
        console.error('❌ Error processing record ID:', record.id, error);
      }
    }

    if (batch.length > 0) {
      try {
        await this.healthFacilityModel.insertMany(batch);
        console.log(`Inserted remaining batch of ${batch.length} records`);
      } catch (error) {
        console.error('❌ Error inserting remaining data:', error);
      }
    }

    console.log('Data processing complete');
  }

  async scriptForMigratingSubscriber() {
    const fullPath = path.resolve(
      __dirname,
      '//home/hi/Documents/ns-old-subscriber-8-jan.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    const BATCH_SIZE = 1000; // Define a suitable batch size
    let batch = [];
    for (const record of jsonData) {
      try {
        console.log(
          'Processing record ID:',
          record.id,
          record.state_id,
          record.district_id,
          record.block_id,
          record.health_facility_id,
          record.cadre_id,
          record.country_id,
          record.name,
          record.phone_no,
        );

        // Parallelize these find operations
        const [
          countryId,
          stateId,
          districtId,
          blockId,
          healthFacilityId,
          cadreId,
        ] = await Promise.all([
          this.countryModel.findOne({ id: record.country_id }),
          this.stateModel.findOne({ id: record.state_id }),
          this.districtModel.findOne({ id: record.district_id }),
          this.blockModel.findOne({ id: record.block_id }),
          this.healthFacilityModel.findOne({ id: record.health_facility_id }),
          this.cadreModel.findOne({ id: record.cadre_id }),
        ]);

        if (districtId || stateId || countryId || blockId || healthFacilityId) {
          const result = {
            id: record.id,
            name: record.name,
            phoneNo: record.phone_no,
            password: record.password,
            cadreType: record.cadre_type,
            cadreId: cadreId ? cadreId._id : null,
            healthFacilityId: healthFacilityId ? healthFacilityId._id : null,
            blockId: blockId ? blockId._id : null,
            districtId: districtId ? districtId._id : null,
            stateId: stateId ? stateId._id : null,
            countryId: countryId ? countryId._id : null,
            forgotOtpTime: record.forgot_otp_time,
            registrationDate: record.create_at,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
            isOldUser: true,
            countryCode: '+91',
            userContext: {
              chatHotQuestionOffset: 0,
              feedbackHistory: [],
              queryDetails: {
                isActive: true,
              },
              weeklyAssessmentCount: 0,
            },
          };

          if (
            result.name &&
            result.phoneNo &&
            result.password &&
            result.cadreType &&
            result.id !== undefined
          ) {
            batch.push(result);
          } else {
            console.log(`Invalid record data for ID: ${record.id}`, result);
          }
        } else {
          console.log('Missing ID for record:', record.id);
        }

        // If the batch size is reached, insert and reset the batch
        if (batch.length >= BATCH_SIZE) {
          await this.subscriberModel.insertMany(batch);
          console.log(`Inserted batch of ${batch.length} records`);
          batch = [];
        }
      } catch (error) {
        console.error('❌ Error processing record ID:', record.id, error);
      }
    }
    if (batch.length > 0) {
      try {
        await this.subscriberModel.insertMany(batch);
        console.log(`Inserted remaining batch of ${batch.length} records`);
      } catch (error) {
        console.error('❌ Error inserting remaining data:', error);
      }
    }

    console.log('Data processing complete');
  }
}
