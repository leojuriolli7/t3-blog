import Head from "next/head";
import { ToastContainer } from "react-toastify";
import RouterProgressBar from "@components/RouterProgressBar";
import MainLayout from "@layouts/MainLayout";
import { ThemeProvider } from "next-themes";
import type { AppProps as NextAppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import PostModal from "@components/PostModal";
import type { NextRouter } from "next/router";
import type { ReactNode } from "react";

export type AppProps = Omit<
  NextAppProps<Record<string, unknown>>,
  "Component"
> & {
  Component: NextAppProps["Component"] & {
    getLayout?: (page: React.ReactElement, router: NextRouter) => ReactNode;
    PageWrapper?: (props: AppProps) => JSX.Element;
  };
};

export interface PageWrapperType {
  (props?: any): JSX.Element;
  PageWrapper?: AppProps["Component"]["PageWrapper"];
}

export const PageWrapper = ({ Component, pageProps }: AppProps) => {
  const { session } = pageProps;

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <Head>
          <title>T3 Blog</title>
          <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
        </Head>
        <RouterProgressBar />
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
        <PostModal />
        <ToastContainer
          closeButton={false}
          toastClassName={() =>
            "relative bg-white dark:bg-zinc-900 text-neutral-800 dark:text-white flex p-1 min-h-15 rounded-md justify-between overflow-hidden cursor-pointer p-5 border-2 dark:border-zinc-800 :dark:fill:slate-50 mb-4"
          }
        />
      </ThemeProvider>
    </SessionProvider>
  );
};
