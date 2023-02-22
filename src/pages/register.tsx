import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { CreateUserInput } from "src/schema/user.schema";

function RegisterPage() {
  const { handleSubmit, register } = useForm<CreateUserInput>();
  const router = useRouter();

  const { mutate: registerUser, error } = trpc.useMutation(
    ["users.register-user"],
    {
      onSuccess: () => {
        router.push("/login");
      },
    }
  );

  const onSubmit = useCallback(
    (values: CreateUserInput) => {
      registerUser(values);
    },
    [registerUser]
  );

  return (
    <div className="mt-20 w-full">
      <form
        className="w-5/12 max-w-xs mx-auto flex flex-col items-center gap-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        {error && error.message}

        <h1 className="text-2xl font-medium text-center">Register</h1>

        <input
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          className="bg-slate-100 p-3 w-full"
        />

        <input
          type="text"
          className="bg-slate-100 p-3 w-full"
          placeholder="your name"
          {...register("name")}
        />

        <button
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
          type="submit"
        >
          Register
        </button>
        <Link href="/login" legacyBehavior passHref>
          <a className="underline text-emerald-600">Login</a>
        </Link>
      </form>
    </div>
  );
}

export default RegisterPage;
