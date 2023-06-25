import * as trpc from "@trpc/server";
import { generateS3Url } from "@utils/aws/generateS3Url";
import { env } from "@env";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3 } from "@server/config/aws";
import type { PrismaClient } from "@prisma/client";
import type { CreatePresignedUrlInput } from "@schema/attachment.schema";

type CreatePresignedUrlHandlerCache = {
  ctx: {
    prisma: PrismaClient;
  };
  input: CreatePresignedUrlInput;
};

const maxFileSize = Number(env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE);
const uploadTimeLimit = Number(env.NEXT_PUBLIC_UPLOADING_TIME_LIMIT);

export const createPresignedUrlHandler = async ({
  ctx,
  input,
}: CreatePresignedUrlHandlerCache) => {
  const { postId, name, type, randomKey } = input;

  const attachmentKey = `${postId}/${randomKey}`;

  const url = generateS3Url(env.AWS_S3_ATTACHMENTS_BUCKET_NAME, attachmentKey);

  const attachment = await ctx.prisma.attachment.create({
    data: {
      postId,
      name,
      type,
      id: attachmentKey,
      url,
    },
  });

  try {
    const { url, fields } = await createPresignedPost(s3, {
      Key: attachment.id,
      Conditions: [
        ["starts-with", "$Content-Type", ""],
        ["content-length-range", 0, maxFileSize],
      ],
      Expires: uploadTimeLimit,
      Bucket: env.AWS_S3_ATTACHMENTS_BUCKET_NAME,
    });

    return { url, fields };
  } catch (e) {
    console.log("e:", e);
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Error creating S3 presigned url",
    });
  }
};
