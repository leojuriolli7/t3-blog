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
  } = trpc.useMutation(["users.request-otp"], {});

  const onSubmit = (values: CreateUserInput) => {
    login({ ...values, redirect: router.asPath });
  };

  const hash = router.asPath.split("#token=")[1];

  if (hash) {
    return <VerifyToken hash={hash} />;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && error.message}

        {isSuccess && <p>Check your e-mail</p>}
        {/* TO-DO: Option to re-send e-mail*/}
        <h1>Login</h1>

        <input
          type="email"
          placeholder="jane.doe@example.com"
          {...register("email")}
        />

        <br />

        <button type="submit">Login</button>
      </form>

      <Link href="/register">Register</Link>
    </>
  );
};

export default LoginForm;
