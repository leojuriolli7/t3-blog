import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { trpc } from "@utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Field from "@components/Field";
import { isObjectEmpty } from "@utils/checkEmpty";
import { UpdateUserInput, updateUserSchema } from "src/schema/user.schema";
import { useSession } from "next-auth/react";
import { Modal } from "./Modal";

type Props = {
  onClose: () => void;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
};

const EditAccountModal: React.FC<Props> = ({ onClose, openState }) => {
  const { data } = useSession();
  const userId = data?.user?.id;

  const { register, handleSubmit, formState, setValue } =
    useForm<UpdateUserInput>({
      resolver: zodResolver(updateUserSchema),
    });

  const utils = trpc.useContext();
  const { errors } = formState;

  const { mutate: update, isLoading } = trpc.useMutation(
    ["users.update-profile"],
    {
      onSuccess: () => {
        utils.invalidateQueries([
          "users.single-user",
          {
            userId: userId as string,
          },
        ]);

        utils.invalidateQueries([
          "posts.posts",
          {
            limit: 4,
            userId: userId as string,
          },
        ]);

        toast.success("Profile updated successfully!");
        onClose();
      },
      onError(error) {
        toast.error(error?.message);
      },
    }
  );

  const onSubmit = useCallback(
    (values: UpdateUserInput) => {
      update({
        ...values,
        userId: userId as string,
      });
    },
    [update, userId]
  );

  useEffect(() => {
    if (userId) setValue("userId", userId);
  }, [setValue, userId]);

  return (
    <Modal openState={openState}>
      <div className="dark:bg-neutral-900 bg-white p-5 h-80 w-80 flex items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-10"
        >
          <h1 className="text-2xl font-medium text-center">
            Change your username
          </h1>

          <Field error={errors.name}>
            <input
              defaultValue={data?.user?.name || ""}
              type="text"
              placeholder="your username"
              className="bg-white border-zinc-300 border-[1px] dark:border-neutral-700 p-3 w-full dark:bg-neutral-800"
              {...register("name")}
            />
          </Field>

          <button
            className="bg-emerald-500 text-white w-6/12 min-w-fit px-8 py-2 mx-auto hover:opacity-80"
            type="submit"
            disabled={isLoading || !isObjectEmpty(errors)}
          >
            Update
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default EditAccountModal;
