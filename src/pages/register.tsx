import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
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

  const onSubmit = (values: CreateUserInput) => {
    registerUser(values);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && error.message}

        <h1>Register</h1>

        <input
          type="email"
          placeholder="jane.doe@example.com"
          {...register("email")}
        />

        <br />

        <input type="text" placeholder="your name" {...register("name")} />

        <button type="submit">Register</button>
      </form>

      <Link href="/login">Login</Link>
    </>
  );
}

export default RegisterPage;
