import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { CreateUserInput } from "src/schema/user.schema";

const VerifyToken = ({ hash }: { hash: string }) => {
  const router = useRouter();

  const { data, isLoading } = trpc.useQuery([
    "users.verify-otp",
    {
      hash,
    },
  ]);

  if (isLoading) return <p>Verifying...</p>;

  router.push(data?.redirect.includes("login") ? "/" : data?.redirect || "/");

  return <p>Redirecting...</p>;
};

const LoginForm = () => {
  const router = useRouter();
  const { handleSubmit, register } = useForm<CreateUserInput>();

  const {
    mutate: login,
    error,
    isSuccess,
    isLoading,
  } = trpc.useMutation(["users.request-otp"], {});

  const onSubmit = (values: CreateUserInput) => {
    login({ ...values, redirect: router.asPath });
  };

  const hash = router.asPath.split("?token=")[1];

  if (hash) {
    return <VerifyToken hash={hash} />;
  }

  return (
    <form
      className="max-w-xs mx-auto flex flex-col items-center gap-10"
      onSubmit={handleSubmit(onSubmit)}
    >
      {error && error.message}

      {isSuccess && <p>Check your e-mail</p>}
      <h1 className="text-2xl font-medium text-center">Login</h1>

      <input
        type="email"
        placeholder="your@email.com"
        {...register("email")}
        className="bg-slate-200 p-3 w-full dark:bg-zinc-800"
      />

      <button
        disabled={isLoading}
        className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
        type="submit"
      >
        Login
      </button>
      <Link href="/register" legacyBehavior passHref>
        <a className="underline text-emerald-600">Register</a>
      </Link>
    </form>
  );
};

export default LoginForm;
