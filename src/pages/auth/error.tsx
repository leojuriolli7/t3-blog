import Link from "next/link";
import { useRouter } from "next/router";
import AuthFeedbackMessage from "@components/AuthFeedbackMessage";
import type { GetServerSidePropsContext } from "next";
import MetaTags from "@components/MetaTags";
import { getServerAuthSession } from "@server/utils/auth";
import { PageWrapper } from "@components/PageWrapper";

export type ErrorType =
  | "default"
  | "configuration"
  | "accessdenied"
  | "verification";

interface ErrorView {
  status: number;
  heading: string;
  message: JSX.Element;
  signin?: JSX.Element;
}

const ErrorPage = () => {
  const router = useRouter();
  const error = router.query.error as ErrorType;

  const errors: Record<ErrorType, ErrorView> = {
    default: {
      status: 200,
      heading: "Error",
      message: (
        <div className="min-w-[200px]">
          <p className="mb-3">An unindentified error has occured.</p>
          <Link
            href="/"
            className="font-medium text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-400"
          >
            Back to home
          </Link>
        </div>
      ),
    },
    configuration: {
      status: 500,
      heading: "Server error",
      message: (
        <div>
          <p>There is a problem with the server configuration.</p>
          <p className="leading-8">
            Check the server logs for more information.
          </p>
        </div>
      ),
    },
    accessdenied: {
      status: 403,
      heading: "Access Denied",
      message: (
        <div>
          <p className="mb-4">You do not have permission to sign in.</p>
          <Link
            href="/auth/signin"
            className="font-medium text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-400"
          >
            Sign in
          </Link>
        </div>
      ),
    },
    verification: {
      status: 403,
      heading: "Unable to sign in",
      message: (
        <div className="flex flex-col gap-3 text-center">
          <p>The sign in link is no longer valid.</p>
          <p>It may have been used already or it may have expired.</p>
        </div>
      ),
      signin: (
        <Link
          className="font-medium text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-400"
          href="/auth/signin"
        >
          Sign in
        </Link>
      ),
    },
  };

  const { heading, message, signin, status } =
    errors[error?.toLowerCase() as ErrorType] ?? errors.default;

  return (
    <>
      <MetaTags title={`Error - ${status}`} />
      <div className="pb-5 shadow dark:bg-zinc-800 dark:shadow-2xl sm:pb-0">
        <AuthFeedbackMessage message={`Error - ${status}`} />
        <h1 className="mx-2 mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {heading}
        </h1>

        <div className="p-5 text-center sm:p-7">
          <div>{message}</div>
          {signin && <div className="mt-5">{signin}</div>}
        </div>
      </div>
    </>
  );
};

ErrorPage.PageWrapper = PageWrapper;

export default ErrorPage;

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
