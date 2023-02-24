import Field from "@components/Field";
import MainLayout from "@components/MainLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { isObjectEmpty } from "@utils/checkEmpty";
import { CreateUserInput, createUserSchema } from "src/schema/user.schema";

function RegisterPage() {
  const { handleSubmit, register, formState } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });
  const { errors } = formState;
  const router = useRouter();

  const {
    mutate: registerUser,
    error: registerError,
    isLoading,
  } = trpc.useMutation(["users.register-user"], {
    onSuccess: () => {
      router.push("/login");
    },
  });

  const onSubmit = useCallback(
    (values: CreateUserInput) => {
      registerUser(values);
    },
    [registerUser]
  );

  useEffect(() => {
    if (registerError) toast.error(registerError?.message);
  }, [registerError]);

  return (
    <MainLayout>
      <form
        className="max-w-xs mx-auto flex flex-col items-center gap-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl font-medium text-center">Register</h1>

        <Field error={errors.email}>
          <input
            type="email"
            placeholder="your@email.com"
            {...register("email")}
            className="bg-white border-zinc-300 border-[1px] dark:border-none p-3 w-full dark:bg-zinc-800"
          />
        </Field>

        <Field error={errors.name}>
          <input
            type="text"
            className="bg-white border-zinc-300 border-[1px] dark:border-none p-3 w-full dark:bg-zinc-800"
            placeholder="your name"
            {...register("name")}
          />
        </Field>

        <button
          disabled={isLoading || !isObjectEmpty(errors)}
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2"
          type="submit"
        >
          Register
        </button>
        <Link href="/login" legacyBehavior passHref>
          <a className="underline text-emerald-600">Login</a>
        </Link>
      </form>
    </MainLayout>
  );
}

export default RegisterPage;
