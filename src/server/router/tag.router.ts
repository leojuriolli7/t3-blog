import { createRouter } from "@server/createRouter";
import { s3 } from "@server/config/aws";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  deleteTagSchema,
  getSingleTagSchema,
  subscribeToTagSchema,
  updateTagSchema,
} from "@schema/tag.schema";
import {
  deleteChildComments,
  isAdminMiddleware,
  isLoggedInMiddleware,
} from "@server/utils";
import { env } from "@env";

export const tagRouter = createRouter()
  .query("all", {
    resolve({ ctx }) {
      const tags = ctx.prisma.tag.findMany();

      return tags;
    },
  })
  .query("single-tag", {
    input: getSingleTagSchema,
    async resolve({ ctx, input }) {
      const tag = await ctx.prisma.tag.findFirst({
        where: {
          id: input.tagId,
        },
        include: {
          subscribers: {
            where: {
              id: ctx?.session?.user?.id,
            },
          },
        },
      });

      const isSubscribed = !!tag?.subscribers?.length;

      return {
        ...tag,
        isSubscribed,
      };
    },
  })
  .middleware(isLoggedInMiddleware)
  .mutation("subscribe", {
    input: subscribeToTagSchema,
    async resolve({ ctx, input }) {
      const tag = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          subscribedTags: {
            where: {
              id: input.tagId,
            },
          },
        },
      });

      const isAlreadyFollowingTag = !!tag?.subscribedTags?.length;

      // user is unsubscribing from tag
      if (isAlreadyFollowingTag) {
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            subscribedTags: {
              disconnect: {
                id: input.tagId,
              },
            },
          },
        });
      }

      // user is subscribing to the tag
      if (!isAlreadyFollowingTag) {
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            subscribedTags: {
              connect: {
                id: input.tagId,
              },
            },
          },
        });
      }
    },
  })
  .middleware(isAdminMiddleware)
  .mutation("update", {
    input: updateTagSchema,
    async resolve({ ctx, input }) {
      const { avatar, backgroundImage, description, name } = input;

      await ctx.prisma.tag.update({
        data: {
          ...(avatar && { avatar }),
          ...(backgroundImage && { backgroundImage }),
          ...(description && { description }),
          ...(name && { name }),
        },
        where: {
          id: input.id,
        },
      });
    },
  })
  .mutation("delete", {
    input: deleteTagSchema,
    async resolve({ ctx, input }) {
      const postsWithOneTag = await ctx.prisma.post.findMany({
        where: {
          tags: {
            every: {
              id: input.id,
            },
          },
        },
        include: {
          Comment: true,
          attachments: true,
        },
      });

      await Promise.all(
        postsWithOneTag.map(async (post) => {
          if (post?.Comment?.length) {
            await Promise.all(
              post.Comment.map(async (comment) => {
                await deleteChildComments(comment.id, ctx.prisma);
              })
            );
          }

          if (post?.attachments?.length) {
            await Promise.all(
              post.attachments.map(async (file) => {
                const deleteAttachmentCommand = new DeleteObjectCommand({
                  Bucket: env.AWS_S3_ATTACHMENTS_BUCKET_NAME,
                  Key: file.id,
                });

                await s3.send(deleteAttachmentCommand);
              })
            );
          }

          await ctx.prisma.post.delete({
            where: {
              id: post.id,
            },
          });
        })
      );

      await ctx.prisma.tag.delete({
        where: {
          id: input.id,
        },
      });
    },
  });
