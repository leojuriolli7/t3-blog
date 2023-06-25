import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { VoteOnPollInput } from "@schema/post.schema";
import * as trpc from "@trpc/server";

type VoteOnPollOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: VoteOnPollInput;
};

export const voteOnPollHandler = async ({ ctx, input }: VoteOnPollOptions) => {
  const poll = await ctx.prisma.poll.findUnique({
    where: {
      postId: input.postId,
    },
    include: {
      options: {
        include: {
          voters: true,
        },
      },
    },
  });

  const voters = poll?.options.flatMap((option) => option.voters);

  if (voters?.find((voter) => voter.id === ctx.session.user.id)) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "You have already voted on this poll.",
    });
  }

  return await ctx.prisma.pollOption.update({
    data: {
      voters: {
        connect: {
          id: ctx.session.user.id,
        },
      },
    },
    where: {
      id: input.optionId,
    },
  });
};
