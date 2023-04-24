import React from "react";
import MainLayout from "@components/MainLayout";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import MetaTags from "@components/MetaTags";
import Spinner from "@components/Spinner";

/**
 * This page is where new users logging in for the first time are
 * redirected to, by Next Auth. Here we will just create two welcome
 * notifications and redirect them back on their way.
 */
const NewUserPage: React.FC = () => {
  return (
    <>
      <MetaTags title="Loading..." />
      <MainLayout>
        <div className="w-full h-[50vh] overflow-y-hidden flex justify-center items-center">
          <Spinner />
        </div>
      </MainLayout>
    </>
  );
};

export default NewUserPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

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
