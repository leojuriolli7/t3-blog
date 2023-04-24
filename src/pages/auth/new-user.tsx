import React from "react";
import MainLayout from "@components/MainLayout";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import MetaTags from "@components/MetaTags";
import Spinner from "@components/Spinner";

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
    const welcomeNotification = prisma.notification.create({
      data: {
        type: "WELCOME" as const,
        notifierId: session?.user.id,
        notifiedId: session?.user.id,
      },
    });

    const firstPostNotification = prisma.notification.create({
      data: {
        type: "FIRST-POST" as const,
        notifierId: session?.user.id,
        notifiedId: session?.user.id,
      },
    });

    // fetching in parallel to reduce wait.
    await Promise.all([welcomeNotification, firstPostNotification]);
  }

  return { redirect: { destination: callbackUrl || "/" } };
}
