import * as trpc from "@trpc/server";
import { createRouter } from "@server/createRouter";
import {
  createPresignedUrlSchema,
  createPresignedAvatarUrlSchema,
  createPresignedTagUrl,
} from "@schema/attachment.schema";
import { s3 } from "@server/config/aws";
import { env } from "@env";
import { isLoggedInMiddleware } from "@server/utils/middlewares";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { generateS3Url } from "@utils/aws/generateS3Url";
import { v4 } from "uuid";

const maxFileSize = Number(env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE);
const uploadTimeLimit = Number(env.NEXT_PUBLIC_UPLOADING_TIME_LIMIT);

export const attachmentsRouter = createRouter()
  .middleware(isLoggedInMiddleware)
  .mutation("create-presigned-url", {
    input: createPresignedUrlSchema,
    async resolve({ ctx, input }) {
      const { postId, name, type, randomKey } = input;

      const attachmentKey = `${postId}/${randomKey}`;

      const url = generateS3Url(
        env.AWS_S3_ATTACHMENTS_BUCKET_NAME,
        attachmentKey
      );

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
          message: "Error creating S3 presigned avatar url",
        });
      }
    },
  })
  .mutation("create-presigned-post-body-url", {
    async resolve({ ctx }) {
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
    },
  })
  .mutation("create-presigned-tag-url", {
    input: createPresignedTagUrl,
    async resolve({ input }) {
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
    },
  });
