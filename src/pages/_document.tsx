import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="google-site-verification"
          content="Th1vj3qhx4-1_Yzg52ScWKjwSkc3QLje1wG5WAuM0rQ"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-neutral-50 dark:bg-zinc-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
