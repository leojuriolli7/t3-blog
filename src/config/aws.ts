import * as aws from "aws-sdk";

export const UPLOAD_MAX_FILE_SIZE = 10485760; // 10MB
export const UPLOAD_MAX_NUMBER_OF_FILES = 4;
export const UPLOADING_TIME_LIMIT = 30;

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "t3-images-bucket";
export const s3 = new aws.S3();
