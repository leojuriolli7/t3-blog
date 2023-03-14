import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { trpc } from "@utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Field from "@components/Field";
import { isObjectEmpty } from "@utils/checkEmpty";
import { UpdateUserInput, updateUserSchema } from "@schema/user.schema";
import { Modal } from "./Modal";
import { useRouter } from "next/router";
import { User } from "@utils/types";
import Image from "next/image";

type Props = {
  onClose: () => void;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  user?: User;
};

const EditAccountModal: React.FC<Props> = ({
  onClose,
  openState,
  user: userInformation,
}) => {
  const router = useRouter();
  const userId = router.query.userId as string;

  const [isOpen] = openState;

  const { register, handleSubmit, formState, setValue, watch } =
    useForm<UpdateUserInput>({
      resolver: zodResolver(updateUserSchema),
    });

  const utils = trpc.useContext();
  const bio = watch("bio");
  const bioLength = bio?.length || 0;
  const { errors } = formState;

  const { mutate: update, isLoading: updating } = trpc.useMutation(
    ["users.update-profile"],
    {
      onSuccess: () => {
        utils.invalidateQueries([
          "users.single-user",
          {
            userId: userId,
          },
        ]);

        utils.invalidateQueries([
          "posts.posts",
          {
            limit: 4,
            userId: userId,
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
        ...(values.name && {
          name: values.name,
        }),
        ...(values.bio && {
          bio: values.bio,
        }),
        userId: userId,
      });
    },
    [update, userId]
  );

  useEffect(() => {
    if (userId) setValue("userId", userId);
  }, [setValue, userId]);

  useEffect(() => {
    if (userInformation?.name && isOpen) {
      setValue("name", userInformation?.name);
      setValue("bio", userInformation?.bio || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal openState={openState} alwaysCentered>
      <div className="relative overflow-hidden dark:bg-neutral-900 bg-white sm:p-12 p-8 flex items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-5"
        >
          <div className="w-fit mx-auto">
            <Image
              src={userInformation?.image || "/static/default-profile.jpg"}
              width={92}
              height={92}
              alt="Your profile picture"
              className="rounded-full"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Edit your account
            </h1>

            <p className="text-md leading-6 text-gray-600 dark:text-gray-500">
              Make your account your own.
            </p>
          </div>

          <Field error={errors.name} label="username">
            <input
              defaultValue={userInformation?.name || ""}
              type="text"
              placeholder="your username"
              className="block w-full border-0 py-2 px-3.5 text-gray-900 dark:text-neutral-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:bg-neutral-900 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              {...register("name")}
            />
          </Field>

          <Field error={errors.bio} label="bio">
            <textarea
              defaultValue={userInformation?.bio || ""}
              placeholder="your bio"
              max={160}
              className="block w-full border-0 py-2 px-3.5 h-24 text-gray-900 dark:text-neutral-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:bg-neutral-900 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              {...register("bio")}
            />
            <p className="absolute w-full text-right text-sm dark:text-neutral-500">
              {bioLength}/160
            </p>
          </Field>

          <Field label="e-mail">
            <input
              type="text"
              disabled
              placeholder="your email"
              defaultValue={userInformation?.email || ""}
              className="block w-full border-0 py-2 px-3.5 text-gray-900 disabled:text-gray-400 dark:disabled:text-neutral-500 dark:disabled:bg-neutral-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:cursor-not-allowed"
            />
          </Field>

          <button
            className="bg-emerald-500 text-white w-full min-w-fit px-8 py-2 mx-auto hover:opacity-80 mt-7"
            type="submit"
            disabled={!userInformation || updating || !isObjectEmpty(errors)}
          >
            Update
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default EditAccountModal;
