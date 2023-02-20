import "@styles/globals.css";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { withTRPC } from "@trpc/next";
import type { AppProps } from "next/app";
import superjson from "superjson";
import { AppRouter } from "@server/router/app.router";
import { url } from "../constants";
import { trpc } from "@utils/trpc";
import { UserContextProvider } from "src/context/user.context";

function App({ Component, pageProps }: AppProps) {
  const { data, isLoading } = trpc.useQuery(["users.me"]);

  if (isLoading) return <p>Loading user...</p>;

  return (
    <UserContextProvider value={data}>
      <main>
        <Component {...pageProps} />
      </main>
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
          return {
            // Add headers to the request into the server,
            // this way the server will have access to the cookies.
            ...ctx.req.headers,
            // Request is done on the server.
            "x-ssr": 1,
          };
        }

        return {};
      },
      links,
      transformer: superjson,
    };
  },
  ssr: false,
})(App);
