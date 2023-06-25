import * as trpc from "@trpc/server";
import { env } from "@env";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3 } from "@server/config/aws";
import type { CreatePresignedTagUrlInput } from "@schema/attachment.schema";

type CratePresignedTagUrlHandlerCache = {
  input: CreatePresignedTagUrlInput;
};

const maxFileSize = Number(env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE);
const uploadTimeLimit = Number(env.NEXT_PUBLIC_UPLOADING_TIME_LIMIT);

export const createPresignedTagUrlHandler = async ({
  input,
}: CratePresignedTagUrlHandlerCache) => {
  const { tagName, type } = input;

  try {
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: env.NEXT_PUBLIC_AWS_S3_TAG_IMAGES_BUCKET_NAME,
      Key: `${tagName}/${type}`,
      Expires: uploadTimeLimit,
      Conditions: [
        ["starts-with", "$Content-Type", "image/"],
        ["content-length-range", 0, maxFileSize],
      ],
    });

    return { url, fields };
  } catch (e) {
    console.log("e:", e);
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Error creating S3 presigned tag url",
    });
  }
};
