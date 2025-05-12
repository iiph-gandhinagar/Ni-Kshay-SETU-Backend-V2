import { rejects } from 'assert';
import * as AWS from 'aws-sdk';
import moment from 'moment';
import * as AWSCONFIG from '../config/awsConfig';

const S3_CONF = AWSCONFIG.development;
console.log('S3_CONF ----------');

AWS.config.update({
  accessKeyId: S3_CONF.accessKeyId,
  secretAccessKey: S3_CONF.secretAccessKey,
  region: S3_CONF.region,
});

async function s3UploadDocument(
  fileData: { originalname: any; buffer: any; mimetype: any },
  s3FolderPath: string,
) {
  console.log('s3UploadDocument calling --------------');
  console.log(fileData.originalname);
  const originalFileName = fileData.originalname;
  const fileName = originalFileName
    .split('.')
    .map((value: string) => value.trim().replace(/[^a-zA-Z0-9]/g, '_'));
  const fileExt = originalFileName
    .substr(originalFileName.lastIndexOf('.') + 1, originalFileName.length)
    .toLowerCase();
  const date = moment(new Date()).utcOffset('+05:30').format('DD-MM-YYYY');
  const time = moment(new Date()).utcOffset('+05:30').format('HH-mm');
  const key = `${fileName[0]}_${date}_${time}.${fileExt}`;
  try {
    const s3 = new AWS.S3();
    return await new Promise((resolve) => {
      const params = {
        Bucket: `${S3_CONF.bucket}/${s3FolderPath}`,
        Key: `${key}`,
        Body: fileData?.buffer,
        ContentEncoding: 'base64',
        ContentType: `${fileData.mimetype}`,
        ACL: S3_CONF.acl,
      };
      console.log('before s3 upload function calling ------>');
      // Uploading files to the bucket
      s3.upload(params, (err, data) => {
        if (err) {
          console.log('Error in s3 upload:', err);
          rejects(err);
        }
        const keyData = data.Location.split('/').pop(); // 2020
        console.log('keyData ---->', keyData);
        resolve(`${keyData}`);
      });
    });
  } catch (error) {
    console.log(
      '❌ ERROR: util || s3Upload || docUploadService || s3UploadDocument() ',
    );
    console.log(JSON.stringify(error));
    throw error;
  }
}

export const uploadDocumentService = async (data: any, files: any) => {
  const S3_CONF = AWSCONFIG.development;
  console.log('files => ', files);
  let s3FolderPath: string;
  if (data.isMaterial && data.isMaterial.toString() === 'true') {
    console.log('type of material --->', data.typeOfMaterial);
    if (data.typeOfMaterial == 'videos') {
      s3FolderPath = `${S3_CONF.folder.resourceMaterial}/videos`;
    } else if (data.typeOfMaterial == 'ppt') {
      s3FolderPath = `${S3_CONF.folder.resourceMaterial}/ppt`;
    } else if (data.typeOfMaterial == 'pdfs') {
      s3FolderPath = `${S3_CONF.folder.resourceMaterial}/pdfs`;
    } else if (data.typeOfMaterial == 'images') {
      console.log('inside images upload --->');
      s3FolderPath = `${S3_CONF.folder.resourceMaterial}/images`;
    } else {
      s3FolderPath = `${S3_CONF.folder.resourceMaterial}/other`;
    }
  }
  if (data.isManageTb && data.isManageTb.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.manageTb}`;
  }
  if (data.isCertificate && data.isCertificate.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.certificate}`;
  }
  if (data.isFlashSimilarApp && data.isFlashSimilarApp.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.flashSimilarApp}`;
  }
  if (data.isFeedback && data.isFeedback.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.feedback}`;
  }
  if (data.isTour && data.isTour.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.tour}`;
  }
  if (data.isDiagnosis && data.isDiagnosis.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.diagnosis}`;
  }
  if (data.isTreatment && data.isTreatment.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.treatment}`;
  }
  if (data.isGuidanceOnADR && data.isGuidanceOnADR.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.guidanceOnADR}`;
  }
  if (data.isLatentTb && data.isLatentTb.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.latentTb}`;
  }
  if (data.isCgcIntervention && data.isCgcIntervention.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.cgcIntervention}`;
  }
  if (data.isDynamicAlgo && data.isDynamicAlgo.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.dynamicAlgo}`;
  }
  if (data.isStaticBlog && data.isStaticBlog.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.staticBlog}`;
  }
  if (data.isStaticWhatWeDo && data.isStaticWhatWeDo.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.staticWhatWeDo}`;
  }
  if (data.isStaticModule && data.isStaticModule.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.staticModule}`;
  }
  if (
    data.isStaticResourceMaterial &&
    data.isStaticResourceMaterial.toString() === 'true'
  ) {
    s3FolderPath = `${S3_CONF.folder.staticResourceMaterial}`;
  }
  if (data.isStaticRelease && data.isStaticRelease.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.staticRelease}`;
  }
  if (
    data.isStaticTestimonial &&
    data.isStaticTestimonial.toString() === 'true'
  ) {
    s3FolderPath = `${S3_CONF.folder.staticTestimonial}`;
  }
  if (
    data.isStaticKeyFeature &&
    data.isStaticKeyFeature.toString() === 'true'
  ) {
    s3FolderPath = `${S3_CONF.folder.staticKeyFeature}`;
  }
  if (
    data.isDifferentialCare &&
    data.isDifferentialCare.toString() === 'true'
  ) {
    s3FolderPath = `${S3_CONF.folder.differentialCare}`;
  }
  if (data.isUserProfile && data.isUserProfile.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.userProfile}`;
  }
  if (data.isAdminUser && data.isAdminUser.toString() === 'true') {
    s3FolderPath = `${S3_CONF.folder.adminUser}`;
  }
  console.log('files', files);
  if (files && files.length > 0) {
    try {
      const uploadImage = files.map(async (uploadedImage: any) => {
        const uploadPath = await s3UploadDocument(
          uploadedImage,
          `${s3FolderPath}`,
        );
        const finalDocURL = `${s3FolderPath}/${uploadPath}`;
        return finalDocURL;
      });
      console.log(uploadImage, 'check106');
      const uploadedFiles = await Promise.all(uploadImage);
      console.log('upload Files --->', uploadedFiles);
      return uploadedFiles;
    } catch (error) {
      console.error('❌ Error processing files:', error);
      return {
        status: false,
        message: 'Error processing files',
        error: error,
      };
    }
  } else {
    return {
      status: false,
      message: 'No files to process',
    };
  }
};
