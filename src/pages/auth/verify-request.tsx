import React from "react";
import MainLayout from "@components/MainLayout";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import AuthFeedbackMessage from "@components/AuthFeedbackMessage";
import MetaTags from "@components/MetaTags";

const VerifyEmailPage: React.FC = () => {
  return (
    <>
      <MetaTags title="Link sent to your e-mail" />
      <MainLayout>
        <div className="relative shadow dark:shadow-2xl dark:bg-neutral-800 pb-5 sm:pb-0">
          <AuthFeedbackMessage message="E-mail sent" type="success" />
          <div className="p-6 text-center">
            <h1 className="mt-6 sm:text-2xl text-xl font-bold tracking-tight mx-2 text-gray-900 dark:text-white">
              E-mail sent to your e-mail address.
            </h1>

            <p className="mt-4">
              Check your inbox for your magic link. It provides a{" "}
              <span className="italic text-emerald-600 dark:text-emerald-400">
                password-less{" "}
              </span>
              access to your account.
            </p>

            <div className="mt-5">
              <a className="text-center cursor-pointer text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 underline">
                Go back to home
              </a>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default VerifyEmailPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  if (session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
