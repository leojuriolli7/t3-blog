import Router from "next/router";
import NProgress from "nprogress";

type RouterEvent = {
  shallow: boolean;
};

NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: false,
});

Router.events.on(
  "routeChangeStart",
  (url: string, { shallow }: RouterEvent) => {
    if (!shallow) NProgress.start();
  }
);
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const RouterProgressBar = () => null;

export default RouterProgressBar;
