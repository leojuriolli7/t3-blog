import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@env";

export const UPLOAD_MAX_FILE_SIZE = 10485760; // 10MB
export const UPLOAD_MAX_NUMBER_OF_FILES = 4;
export const UPLOADING_TIME_LIMIT = 30;

export const s3 = new S3Client({
  region: env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
