import React, { useCallback, useState } from "react";
import type { GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import MetaTags from "@components/MetaTags";
import Button from "@components/Button";
import { getServerAuthSession } from "@server/utils/auth";

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
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="mt-6 text-center text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Are you sure you want to sign out?
            </h1>
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Or{" "}
              <Link
                href="/"
                className="font-medium text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400"
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
              className="flex h-[38px] w-full justify-center rounded-lg font-bold"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignoutPage;

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req, res });

  // If the user is not logged in, redirect.
  if (!session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
