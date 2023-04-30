import { S3Client } from "@aws-sdk/client-s3";

export const UPLOAD_MAX_FILE_SIZE = 10485760; // 10MB
export const UPLOAD_MAX_NUMBER_OF_FILES = 4;
export const UPLOADING_TIME_LIMIT = 30;

export const S3_REGION = process.env.NEXT_PUBLIC_AWS_REGION || "sa-east-1";

export const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
