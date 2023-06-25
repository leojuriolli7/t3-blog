import { s3 } from "@server/config/aws";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  deleteTagSchema,
  getSingleTagSchema,
  getSubscribedTagsSchema,
  subscribeToTagSchema,
  updateTagSchema,
} from "@schema/tag.schema";
import { deleteChildComments } from "@server/utils";
import { env } from "@env";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@server/trpc";

export const tagRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const tags = ctx.prisma.tag.findMany();

    return tags;
  }),

  singleTag: publicProcedure
    .input(getSingleTagSchema)
    .query(async ({ ctx, input }) => {
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
          _count: {
            select: {
              subscribers: true,
            },
          },
        },
      });

      const isSubscribed = !!tag?.subscribers?.length;

      return {
        ...tag,
        isSubscribed,
      };
    }),

  subscribe: protectedProcedure
    .input(subscribeToTagSchema)
    .mutation(async ({ ctx, input }) => {
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
    }),

  subscribed: protectedProcedure
    .input(getSubscribedTagsSchema)
    .query(async ({ ctx, input }) => {
      const tags = await ctx.prisma.tag.findMany({
        where: {
          subscribers: {
            some: {
              id: ctx.session.user.id,
            },
          },
          ...(input.query && {
            AND: {
              name: {
                contains: input.query,
              },
            },
          }),
        },
        take: input.limit + 1,
        skip: input.skip,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (tags.length > input.limit) {
        const nextItem = tags.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        tags,
        nextCursor,
      };
    }),
  update: adminProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx, input }) => {
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
    }),

  delete: adminProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx, input }) => {
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
    }),
});
