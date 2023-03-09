import MainLayout from "@components/MainLayout";
import { signIn } from "next-auth/react";
import type { SignInErrorTypes } from "next-auth/core/pages/signin";
import React, { useCallback, useState } from "react";
import { BsDiscord, BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import { useRouter } from "next/router";
import AuthFeedbackMessage from "@components/AuthFeedbackMessage";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSidePropsContext, NextPage } from "next";

type SigninOptions = "github" | "google" | "discord" | "email";

const errors: Record<SignInErrorTypes, string> = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in.",
};

const SigninPage: NextPage = () => {
  const router = useRouter();
  const errorType = router.query.error as SignInErrorTypes;
  const callbackUrl = router.query.callbackUrl as string;

  const error = errorType && (errors[errorType] ?? errors.default);

  const [email, setEmail] = useState<string | undefined>(undefined);

  const handleSignin = useCallback(
    (type: SigninOptions) => () => {
      signIn(type, {
        callbackUrl: callbackUrl || "/",
        ...(type === "email" && {
          email,
        }),
      });
    },
    [email, callbackUrl]
  );

  return (
    <MainLayout>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <AuthFeedbackMessage message={error} />
            <h1 className="mt-6 text-center font-bold sm:text-3xl text-2xl tracking-tight text-gray-900 dark:text-white">
              Sign in to your account
            </h1>
          </div>

          <div className="flex w-full flex-col gap-3">
            <button
              onClick={handleSignin("google")}
              type="button"
              className="group relative flex w-full justify-center gap-2 bg-white py-2 px-3 text-sm font-semibold text-neutral-800 shadow-sm hover:opacity-80 ring-1 ring-inset ring-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <FcGoogle size={20} />
              Sign in with Google
            </button>

            <button
              onClick={handleSignin("discord")}
              type="button"
              className="group relative flex w-full justify-center gap-2 bg-indigo-500 py-2 px-3 text-sm font-semibold text-neutral-100 shadow-sm hover:opacity-80 ring-1 ring-inset ring-gray-300 dark:ring-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <BsDiscord size={19} color="white" />
              Sign in with Discord
            </button>

            <button
              onClick={handleSignin("github")}
              type="button"
              className="group relative flex w-full justify-center gap-2 bg-zinc-800 py-2 px-3 text-sm font-semibold text-neutral-100 shadow-sm hover:opacity-80 ring-1 ring-inset ring-gray-300 dark:ring-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <BsGithub size={19} color="white" />
              Sign in with Github
            </button>

            <div className="inline-flex items-center justify-between w-full">
              <hr className="w-[42%] h-1 my-8 bg-gray-200 border-0 rounded dark:bg-neutral-700" />
              <div className="absolute px-4 -translate-x-1/2 left-1/2">
                <p className="text-sm font-bold text-gray-400">or</p>
              </div>
              <hr className="w-[42%] h-1 my-8 bg-gray-200 border-0 rounded dark:bg-neutral-700" />
            </div>

            <div>
              <form>
                <input
                  type="email"
                  placeholder="your e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full border-0 text-gray-900 mb-2 disabled:text-gray-400 dark:disabled:text-neutral-500 dark:disabled:bg-neutral-700 shadow-sm dark:text-neutral-200 ring-1 ring-inset ring-gray-300 dark:ring-neutral-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:cursor-not-allowed py-2 px-4"
                  required
                />
                <button
                  onClick={handleSignin("email")}
                  type="button"
                  disabled={!email}
                  className="group relative flex w-full justify-center gap-2 bg-emerald-600 py-2 px-3 text-sm font-semibold text-neutral-100 shadow-sm hover:opacity-80 ring-1 ring-inset ring-gray-300 dark:ring-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <MdEmail size={19} color="white" />
                  Sign in with e-mail
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SigninPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  if (session) {
    return { redirect: { destination: "/" } };
  }

  // Could return the providers as an array if we wanted.
  // const providers = await getProviders();

  return {
    props: {},
  };
}
