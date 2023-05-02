import { env } from "@env";

/**
 * This helper function takes an S3 Bucket name and any params for the
 * object URL, and returns the generated URL.
 */
export function generateS3Url(bucketName: string, params: string) {
  const s3Region = env.NEXT_PUBLIC_AWS_REGION;

  const generatedUrl = `https://${bucketName}.s3.${s3Region}.amazonaws.com/${params}`;

  return generatedUrl;
}
