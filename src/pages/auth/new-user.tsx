import React from "react";
import type { GetServerSidePropsContext } from "next";
import { prisma } from "@utils/prisma";
import MetaTags from "@components/MetaTags";
import Spinner from "@components/Spinner";
import { getServerAuthSession } from "@server/utils/auth";
import { PageWrapper } from "@components/PageWrapper";

/**
 * This page is where new users logging in for the first time are
 * redirected to, by Next Auth. Here we will just create two welcome
 * notifications and redirect them back on their way.
 */
const NewUserPage = () => {
  return (
    <>
      <MetaTags title="Loading..." />
      <div className="flex h-[50vh] w-full items-center justify-center overflow-y-hidden">
        <Spinner />
      </div>
    </>
  );
};

NewUserPage.PageWrapper = PageWrapper;

export default NewUserPage;

export async function getServerSideProps({
  req,
  res,
  ...context
}: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req, res });

  const callbackUrl = context.query.callbackUrl as string;

  if (!session?.user) {
    return { redirect: { destination: "/" } };
  }

  // Only create welcome notifications once.
  const userHasAlreadyBeenWelcomed = await prisma.notification.findFirst({
    where: {
      type: "WELCOME",
      notifiedId: session?.user.id,
    },
  });

  if (!userHasAlreadyBeenWelcomed) {
    const noAvatar = !session?.user?.image;
    const noUsername = !session?.user?.name;

    const createSystemNotification = (type: string) => {
      return prisma.notification.create({
        data: {
          type,
          notifierId: session?.user.id,
          notifiedId: session?.user.id,
        },
      });
    };

    const welcomeNotification = createSystemNotification("WELCOME");
    const firstPostNotification = createSystemNotification("FIRST-POST");
    const noUsernameNotification = createSystemNotification("NO-USERNAME");
    const noAvatarNotification = createSystemNotification("NO-AVATAR");

    const promisesToAwait = [welcomeNotification, firstPostNotification];

    // If the user does not have avatar or username, they will be alerted on first sign-in.
    if (noAvatar) promisesToAwait.push(noAvatarNotification);
    if (noUsername) promisesToAwait.push(noUsernameNotification);

    // fetching in parallel to reduce wait.
    await Promise.all(promisesToAwait);
  }

  return { redirect: { destination: callbackUrl || "/" } };
}
