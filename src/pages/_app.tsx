import Head from "next/head";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import RouterProgressBar from "@components/RouterProgressBar";
import MainLayout from "@layouts/MainLayout";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { trpc } from "@utils/trpc";
import PostModal from "@components/PostModal";
import "@styles/globals.scss";
import "react-markdown-editor-lite/lib/index.css";
import "react-toastify/dist/ReactToastify.css";
import "nprogress/nprogress.css";
import "keen-slider/keen-slider.min.css";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
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
}

export default trpc.withTRPC(App);
