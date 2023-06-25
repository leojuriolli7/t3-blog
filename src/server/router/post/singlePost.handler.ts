import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";
import type { GetSinglePostInput } from "@schema/post.schema";
import { formatDate, getPostWithLikes, markdownToHtml } from "@server/utils";

type SinglePostOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session | null;
  };
  input: GetSinglePostInput;
};

export const singlePostHandler = async ({ ctx, input }: SinglePostOptions) => {
  const post = await ctx.prisma.post.findFirst({
    where: {
      id: input.postId,
    },
    include: {
      user: true,
      likes: true,
      tags: true,
      link: true,
      attachments: true,
      poll: {
        include: {
          options: {
            include: {
              voters: true,
            },
          },
        },
      },
      ...(ctx.session?.user?.id && {
        favoritedBy: {
          where: {
            userId: ctx.session.user.id,
          },
        },
      }),
    },
  });

  const postWithLikes = getPostWithLikes(post, ctx?.session);
  const favoritedByUser = postWithLikes.favoritedBy?.some(
    (favorite) => favorite.userId === ctx?.session?.user?.id
  );

  const voters = post?.poll?.options.flatMap((option) => option.voters);

  const alreadyVoted = voters?.some(
    (voter) => voter.id === ctx?.session?.user.id
  );

  const poll = post?.poll
    ? {
        ...post?.poll,
        alreadyVoted,
        voters: voters?.length || 0,
        options: post?.poll?.options.map((option) => ({
          ...option,
          ...(option.voters.some(
            (voter) => voter.id === ctx?.session?.user?.id
          ) && {
            votedByMe: true,
          }),
        })),
      }
    : null;

  const htmlBody = await markdownToHtml(post?.body || "", {
    removeLinksAndImages: false,
    truncate: false,
    linkifyImages: true,
  });

  const formattedDate = formatDate(post!.createdAt);

  return {
    ...postWithLikes,
    body: htmlBody,
    createdAt: formattedDate,
    // By also sendind the markdown body, we avoid having to
    // parse html back to MD when needed.
    markdownBody: post?.body,
    favoritedByMe: favoritedByUser,
    poll,
  };
};
