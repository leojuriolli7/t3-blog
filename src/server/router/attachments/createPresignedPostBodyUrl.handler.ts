import * as trpc from "@trpc/server";
import { v4 } from "uuid";
import { env } from "@env";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3 } from "@server/config/aws";
import type { Session } from "next-auth";

type CreatePresignedPostBodyUrlHandlerCache = {
  ctx: {
    session: Session;
  };
};

const maxFileSize = Number(env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE);
const uploadTimeLimit = Number(env.NEXT_PUBLIC_UPLOADING_TIME_LIMIT);

export const createPresignedPostBodyUrlHandler = async ({
  ctx,
}: CreatePresignedPostBodyUrlHandlerCache) => {
  const userId = ctx.session.user.id;
  const randomKey = v4();

  const key = `${userId}-${randomKey}`;

  try {
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: env.NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME,
      Key: key,
      Expires: uploadTimeLimit,
      Conditions: [
        ["starts-with", "$Content-Type", "image/"],
        ["content-length-range", 0, maxFileSize],
      ],
    });

    return { url, fields, key };
  } catch (e) {
    console.log("e:", e);
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Error creating S3 presigned post body url",
    });
  }
};
