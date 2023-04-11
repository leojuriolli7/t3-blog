import React, { useCallback, useState } from "react";
import MainLayout from "@components/MainLayout";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]";
import { useRouter } from "next/router";
import MetaTags from "@components/MetaTags";
import Button from "@components/Button";

const SignoutPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const callbackUrl = router.query.callbackUrl as string;

  const handleSignout = useCallback(async () => {
    setIsLoading(true);
    await signOut({
      callbackUrl: callbackUrl || "/",
    });

    setIsLoading(false);
  }, [callbackUrl]);

  return (
    <>
      <MetaTags title="Sign out" />
      <MainLayout>
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="mt-6 text-center sm:text-2xl text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Are you sure you want to sign out?
              </h1>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Or{" "}
                <Link
                  href="/"
                  className="font-medium underline text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                >
                  go back to home
                </Link>
              </p>
            </div>

            <div>
              <Button
                loading={isLoading}
                type="button"
                variant="primary"
                onClick={handleSignout}
                className="flex w-full justify-center h-[38px] font-bold"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default SignoutPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is not logged in, redirect.
  if (!session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
