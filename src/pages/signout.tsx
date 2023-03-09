import React, { useCallback } from "react";
import MainLayout from "@components/MainLayout";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]";
import { useRouter } from "next/router";

const SignoutPage: React.FC = () => {
  const router = useRouter();
  const callbackUrl = router.query.callbackUrl as string;

  const handleSignout = useCallback(() => {
    signOut({
      callbackUrl: callbackUrl || "/",
    });
  }, [callbackUrl]);

  return (
    <MainLayout>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="mt-6 text-center sm:text-2xl text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Are you sure you want to sign out?
            </h1>
            <p className="mt-4 text-center text-sm text-gray-600">
              Or{" "}
              <Link href="/" passHref>
                <a className="font-medium underline text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400">
                  go back to home
                </a>
              </Link>
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSignout}
              className="group relative flex w-full justify-center rounded-md bg-emerald-600 py-2 px-3 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
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
