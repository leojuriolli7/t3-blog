import { trpc } from "@utils/trpc";
import "@styles/globals.scss";
import "react-markdown-editor-lite/lib/index.css";
import "react-toastify/dist/ReactToastify.css";
import "nprogress/nprogress.css";
import "keen-slider/keen-slider.min.css";
import type { AppProps } from "@components/PageWrapper";

function App(props: AppProps) {
  const { Component, pageProps } = props;

  if (Component.PageWrapper !== undefined) return Component.PageWrapper(props);

  return <Component {...pageProps} />;
}

export default trpc.withTRPC(App);
