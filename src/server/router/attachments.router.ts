import * as trpc from "@trpc/server";
import { createRouter } from "@server/createRouter";
import {
  createPresignedUrlSchema,
  createPresignedAvatarUrlSchema,
  createPresignedPostBodyUrlSchema,
} from "@schema/attachment.schema";
import {
  s3,
  UPLOAD_MAX_FILE_SIZE,
  UPLOADING_TIME_LIMIT,
} from "@server/config/aws";
import { env } from "@env";
import { isLoggedInMiddleware } from "@server/utils/isLoggedInMiddleware";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

export const attachmentsRouter = createRouter()
  .middleware(isLoggedInMiddleware)
  .mutation("create-presigned-url", {
    input: createPresignedUrlSchema,
    async resolve({ ctx, input }) {
      const { postId, name, type, randomKey } = input;

      const attachmentKey = `${postId}/${randomKey}`;
      const url = `https://${env.AWS_S3_ATTACHMENTS_BUCKET_NAME}.s3.${env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${attachmentKey}`;

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
            ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
          ],
          Expires: UPLOADING_TIME_LIMIT,
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
    },
  })
  .mutation("create-presigned-avatar-url", {
    input: createPresignedAvatarUrlSchema,
    async resolve({ input }) {
      const { userId } = input;
      try {
        const { url, fields } = await createPresignedPost(s3, {
          Bucket: env.NEXT_PUBLIC_AWS_S3_AVATARS_BUCKET_NAME,
          Key: userId,
          Expires: UPLOADING_TIME_LIMIT,
          Conditions: [
            ["starts-with", "$Content-Type", "image/"],
            ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
          ],
        });

        return { url, fields };
      } catch (e) {
        console.log("e:", e);
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Error creating S3 presigned avatar url",
        });
      }
    },
  })
  .mutation("create-presigned-post-body-url", {
    input: createPresignedPostBodyUrlSchema,
    async resolve({ input }) {
      const { userId, randomKey } = input;

      try {
        const { url, fields } = await createPresignedPost(s3, {
          Bucket: env.NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME,
          Key: `${userId}-${randomKey}`,
          Expires: UPLOADING_TIME_LIMIT,
          Conditions: [
            ["starts-with", "$Content-Type", "image/"],
            ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
          ],
        });

        return { url, fields };
      } catch (e) {
        console.log("e:", e);
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Error creating S3 presigned post body url",
        });
      }
    },
  });
