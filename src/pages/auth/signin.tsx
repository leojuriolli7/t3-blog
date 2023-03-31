import MainLayout from "@components/MainLayout";
import { signIn } from "next-auth/react";
import type { SignInErrorTypes } from "next-auth/core/pages/signin";
import React, { useCallback } from "react";
import { BsDiscord, BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import { useRouter } from "next/router";
import AuthFeedbackMessage from "@components/AuthFeedbackMessage";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { GetServerSidePropsContext, NextPage } from "next";
import { useForm } from "react-hook-form";
import {
  SignInWithEmailInput,
  signInWithEmailSchema,
} from "@schema/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import MetaTags from "@components/MetaTags";
import Button from "@components/Button";
import TextInput from "@components/TextInput";

type SigninOptions = "github" | "google" | "discord";

// default next-auth error messages mapped for each error type.
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

  const { handleSubmit, register } = useForm<SignInWithEmailInput>({
    resolver: zodResolver(signInWithEmailSchema),
  });

  const error = errorType && (errors[errorType] ?? errors.default);

  const handleSignIn = useCallback(
    (type: SigninOptions) => () => {
      signIn(type, {
        callbackUrl: callbackUrl || "/",
      });
    },
    [callbackUrl]
  );

  const onEmailSubmit = useCallback(
    (values: SignInWithEmailInput) => {
      signIn("email", {
        callbackUrl: callbackUrl || "/",
        email: values.email,
      });
    },
    [callbackUrl]
  );

  return (
    <>
      <MetaTags title="Sign in" description="Sign in to your account" />
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
              <Button
                onClick={handleSignIn("google")}
                variant="transparent"
                icon={<FcGoogle size={20} />}
                textClass="text-neutral-800"
                className="w-full bg-white ring-1 ring-inset ring-gray-300"
              >
                Sign in with Google
              </Button>

              <Button
                onClick={handleSignIn("discord")}
                variant="transparent"
                textClass="text-neutral-200"
                icon={<BsDiscord size={19} color="white" />}
                className="w-full bg-indigo-500"
              >
                Sign in with Discord
              </Button>

              <Button
                onClick={handleSignIn("github")}
                variant="transparent"
                textClass="text-neutral-200"
                icon={<BsGithub size={19} color="white" />}
                className="w-full bg-zinc-800"
              >
                Sign in with Github
              </Button>

              <div className="inline-flex items-center justify-between w-full">
                <hr className="w-[42%] h-1 my-8 bg-gray-200 border-0 rounded dark:bg-neutral-700" />
                <div className="absolute px-4 -translate-x-1/2 left-1/2">
                  <p className="text-sm font-bold text-gray-400">or</p>
                </div>
                <hr className="w-[42%] h-1 my-8 bg-gray-200 border-0 rounded dark:bg-neutral-700" />
              </div>

              <div>
                <form onSubmit={handleSubmit(onEmailSubmit)}>
                  <TextInput
                    variant="primary"
                    type="email"
                    placeholder="type your e-mail"
                    required
                    {...register("email")}
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full mt-2"
                    icon={<MdEmail size={19} color="white" />}
                  >
                    Sign in with e-mail
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
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
