import React, { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import type { SignInErrorTypes } from "next-auth/core/pages/signin";
import { BsDiscord, BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import { useRouter } from "next/router";
import AuthFeedbackMessage from "@components/AuthFeedbackMessage";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useForm } from "react-hook-form";
import {
  SignInWithEmailInput,
  signInWithEmailSchema,
} from "@schema/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import MetaTags from "@components/MetaTags";
import Button from "@components/Button";
import TextInput from "@components/TextInput";
import { getServerAuthSession } from "@server/utils/auth";

type SigninOptions = "github" | "google" | "discord" | "email";

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

type LoadingState = Record<SigninOptions, boolean>;

const SigninPage: NextPage = () => {
  const router = useRouter();
  const errorType = router.query.error as SignInErrorTypes;
  const callbackUrl = router.query.callbackUrl as string;

  const [isLoading, setIsLoading] = useState<LoadingState>({
    github: false,
    email: false,
    discord: false,
    google: false,
  });

  /**
   * If one of the sign-in options is loading,
   * the rest should be disabled.
   */
  const getDisabledState = (type: SigninOptions) => {
    return Object.entries(isLoading).some(([key, value]) => {
      return key !== type && value === true;
    });
  };

  const { handleSubmit, register } = useForm<SignInWithEmailInput>({
    resolver: zodResolver(signInWithEmailSchema),
  });

  const error = errorType && (errors[errorType] ?? errors.default);

  const handleSignIn = useCallback(
    (type: Exclude<SigninOptions, "email">) => async () => {
      setIsLoading((prev) => ({ ...prev, [type]: true }));

      await signIn(type, {
        callbackUrl: callbackUrl || "/",
      });

      setIsLoading((prev) => ({ ...prev, [type]: false }));
    },
    [callbackUrl]
  );

  const onEmailSubmit = useCallback(
    async (values: SignInWithEmailInput) => {
      setIsLoading((prev) => ({ ...prev, email: true }));

      await signIn("email", {
        callbackUrl: callbackUrl || "/",
        email: values.email,
      });

      setIsLoading((prev) => ({ ...prev, email: false }));
    },
    [callbackUrl]
  );

  return (
    <>
      <MetaTags title="Sign in" description="Sign in to your account" />
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <AuthFeedbackMessage message={error} />
            <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Sign in to your account
            </h1>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button
              disabled={getDisabledState("google")}
              loading={isLoading.google}
              onClick={handleSignIn("google")}
              variant="transparent"
              icon={<FcGoogle size={20} />}
              textClass="text-neutral-800"
              className="w-full rounded-lg bg-white ring-1 ring-inset ring-gray-300"
              spinnerVariant="dark"
            >
              Sign in with Google
            </Button>

            <Button
              disabled={getDisabledState("discord")}
              loading={isLoading.discord}
              onClick={handleSignIn("discord")}
              variant="transparent"
              textClass="text-neutral-200"
              icon={<BsDiscord size={19} color="white" />}
              className="w-full rounded-lg bg-indigo-500"
              spinnerVariant="white"
            >
              Sign in with Discord
            </Button>

            <Button
              disabled={getDisabledState("github")}
              loading={isLoading.github}
              onClick={handleSignIn("github")}
              variant="transparent"
              textClass="text-neutral-200"
              icon={<BsGithub size={19} color="white" />}
              className="w-full rounded-lg bg-zinc-800/70"
              spinnerVariant="white"
            >
              Sign in with Github
            </Button>

            <div className="inline-flex w-full items-center justify-between">
              <hr className="my-8 h-1 w-[42%] rounded border-0 bg-gray-200 dark:bg-neutral-700" />
              <div className="absolute left-1/2 -translate-x-1/2 px-4">
                <p className="text-sm font-bold text-gray-400">or</p>
              </div>
              <hr className="my-8 h-1 w-[42%] rounded border-0 bg-gray-200 dark:bg-neutral-700" />
            </div>

            <div>
              <form onSubmit={handleSubmit(onEmailSubmit)}>
                <TextInput
                  variant="primary"
                  type="email"
                  placeholder="type your e-mail"
                  disabled={isLoading.email}
                  required
                  className="rounded-md"
                  {...register("email")}
                />
                <Button
                  disabled={getDisabledState("email")}
                  loading={isLoading.email}
                  variant="primary"
                  type="submit"
                  className="mt-2 w-full rounded-lg"
                  icon={<MdEmail size={19} color="white" />}
                >
                  Sign in with e-mail
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SigninPage;

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req, res });

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
