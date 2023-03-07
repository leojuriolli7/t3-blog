import React, { useCallback, useEffect, useImperativeHandle } from "react";
import { trpc } from "@utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Field from "@components/Field";
import { isObjectEmpty } from "@utils/checkEmpty";
import { UpdateUserInput, updateUserSchema } from "src/schema/user.schema";
import { useSession } from "next-auth/react";

type Props = {
  onClose: () => void;
};

const EditAccountModal: React.FC<Props> = ({ onClose }) => {
  const { data } = useSession();
  const userId = data!.user!.id;

  const { register, handleSubmit, control, formState } =
    useForm<UpdateUserInput>({
      resolver: zodResolver(updateUserSchema),
      shouldFocusError: false,
    });

  const utils = trpc.useContext();
  const { errors } = formState;

  const {
    mutate: update,
    error: updateError,
    isLoading,
  } = trpc.useMutation(["users.update-profile"], {
    // TO-DO: Optimistic update.
    onSuccess: () => {
      utils.invalidateQueries([
        "users.single-post",
        {
          userId,
        },
      ]);

      toast.success("Profile updated successfully!");
      // onClose();
    },
  });

  const onSubmit = useCallback(
    (values: UpdateUserInput) => {
      update({
        ...values,
        userId,
      });
    },
    [update, userId]
  );

  useEffect(() => {
    if (updateError) {
      toast.error(updateError?.message);
      // onClose();
    }
  }, [updateError, onClose]);

  return (
    <div className="bg-neutral-800 p-5 h-64">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-3xl mx-auto flex flex-col gap-10"
      >
        <h1 className="text-2xl font-medium text-center">Edit your account</h1>

        <Field error={errors.name}>
          <input
            defaultValue={data?.user?.name || ""}
            type="text"
            placeholder="your username"
            className="bg-white border-zinc-300 border-[1px] dark:border-neutral-800 p-3 w-full dark:bg-neutral-900"
            {...register("name")}
          />
        </Field>

        <button
          className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2 mx-auto"
          type="submit"
          disabled={isLoading || !isObjectEmpty(errors)}
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditAccountModal;
