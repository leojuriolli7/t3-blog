import "@styles/globals.css";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { withTRPC } from "@trpc/next";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import superjson from "superjson";
import { AppRouter } from "@server/router/app.router";
import { url } from "../constants";
import { trpc } from "@utils/trpc";
import { ThemeProvider } from "next-themes";
import { UserContextProvider } from "src/context/user.context";
import Head from "next/head";

function App({ Component, pageProps }: AppProps) {
  const { data, isLoading } = trpc.useQuery(["users.me"], {
    refetchInterval: 1000,
  });

  if (isLoading) return <p>Loading user...</p>;

  return (
    <UserContextProvider value={data}>
      <ThemeProvider attribute="class">
        <Head>
          <title>T3 Blog</title>
          <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
        </Head>
        <Component {...pageProps} />
        <ToastContainer
          closeButton={false}
          toastClassName={() =>
            "relative bg-white dark:bg-zinc-900 text-neutral-800 dark:text-white flex p-1 min-h-15 rounded-md justify-between overflow-hidden cursor-pointer p-5 border-2 dark:border-zinc-800 :dark:fill:slate-50 mb-4"
          }
        />
      </ThemeProvider>
    </UserContextProvider>
  );
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    // Defining sub-links:
    // LoggerLink: Log all requests on console for debugging.
    // BatchLink: Send a number of requests together as a batch. (Better performance)
    const links = [
      loggerLink({
        enabled: () => process.env.NEXT_PUBLIC_ENVIRONMENT === "develop",
      }),
      httpBatchLink({
        url,
        maxBatchSize: 10,
      }),
    ];

    const ONE_DAY_SECONDS = 60 * 60 * 24;
    ctx?.res?.setHeader(
      "Cache-Control",
      `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`
    );

    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60,
          },
        },
      },
      headers() {
        if (ctx?.req) {
          const { connection: _connection, ...headers } = ctx.req.headers;
          return {
            ...headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
      links,
      transformer: superjson,
    };
  },
  ssr: true,
})(App);
