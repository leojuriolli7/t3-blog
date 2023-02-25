import Error from "next/error";

const Custom404 = () => {
  return <Error statusCode={404} />;
};

export default Custom404;
