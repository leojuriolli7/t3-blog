import Error from "next/error";

const Custom404 = () => {
  return (
    <div className="bg-white">
      <Error statusCode={404} />
    </div>
  );
};

export default Custom404;
