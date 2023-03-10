import * as trpc from "@trpc/server";
import { createRouter } from "@server/createRouter";
import { Attachment } from "@prisma/client";
import {
  createPresignedUrlSchema,
  deleteAttachmentsSchema,
  getPostAttachments,
} from "@schema/attachment.schema";
import { BUCKET_NAME, s3 } from "src/config/aws";

const UPLOADING_TIME_LIMIT = 30;
const UPLOAD_MAX_FILE_SIZE = 10485760; // 10MB

interface AttachmentMetadata extends Attachment {
  url: string;
}

export const attachmentsRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to use this method.",
      });
    }

    return next();
  })
  .query("get-post-attachments", {
    input: getPostAttachments,
    async resolve({ ctx, input }) {
      const { postId } = input;

      const attachments = await ctx.prisma.attachment.findMany({
        where: {
          postId,
        },
      });

      const extendedFiles: AttachmentMetadata[] = await Promise.all(
        attachments.map(async (file) => {
          return {
            ...file,
            url: await s3.getSignedUrlPromise("getObject", {
              Bucket: BUCKET_NAME,
              Key: `${postId}/${file.id}`,
            }),
          };
        })
      );

      return extendedFiles;
    },
  })
  .mutation("delete-attachment", {
    input: deleteAttachmentsSchema,
    async resolve({ ctx, input }) {
      const { postId } = input;

      const attachment = await ctx.prisma.attachment.findFirst({
        where: {
          id: input.attachmentId,
        },
      });

      if (!attachment || attachment.postId !== postId) {
        throw new Error("invalid access");
      }

      await ctx.prisma.attachment.delete({
        where: {
          id: input.attachmentId,
        },
      });

      await s3
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: `${postId}/${input.attachmentId}`,
        })
        .promise();
    },
  })
  .mutation("create-presigned-url", {
    input: createPresignedUrlSchema,
    async resolve({ ctx, input }) {
      const { postId, name, type } = input;

      const attachment = await ctx.prisma.attachment.create({
        data: {
          postId,
          name,
          type,
        },
      });

      try {
        const { url, fields } = await s3.createPresignedPost({
          Fields: {
            key: `${postId}/${attachment.id}`,
          },
          Conditions: [
            // ["starts-with", "$Content-Type", "image/"],
            ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
          ],
          Expires: UPLOADING_TIME_LIMIT,
          Bucket: BUCKET_NAME,
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
  });