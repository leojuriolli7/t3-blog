import Link from "next/link";

const Custom404 = () => {
  return (
    <div className="mx-auto w-full p-3 text-center">
      <h1 className="inline-block bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 bg-clip-text text-[125px] font-bold text-transparent drop-shadow-2xl dark:opacity-90">
        404
      </h1>

      <div className="mx-auto max-w-[80vw] text-center xs:max-w-[50%]">
        <p className="text-lg text-zinc-700/80 dark:text-zinc-400">
          Sorry, the page you are looking for could not be found.
        </p>
      </div>

      <Link
        href="/"
        className="mt-2 block text-lg text-indigo-400 underline hover:text-indigo-500"
      >
        Click here to go back to the homepage
      </Link>
    </div>
  );
};

export default Custom404;
