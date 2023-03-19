import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { trpc } from "@utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import Field from "@components/Field";
import { UpdateUserInput, updateUserSchema } from "@schema/user.schema";
import { Modal } from "../Modal";
import { useRouter } from "next/router";
import { User } from "@utils/types";
import Avatar from "./Avatar";
import ShouldRender from "@components/ShouldRender";
import { useSession } from "next-auth/react";

type Props = {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  user?: User;
};

const EditAccountModal: React.FC<Props> = ({
  openState,
  user: userInformation,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = router.query.userId as string;

  const [isOpen, setIsOpen] = openState;

  const methods = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  const { register, handleSubmit, formState, setValue, watch } = methods;

  const utils = trpc.useContext();
  const bio = watch("bio");
  const bioLength = bio?.length || 0;
  const { errors } = formState;

  const { mutateAsync: createPresignedUrl } = trpc.useMutation(
    "attachments.create-presigned-avatar-url"
  );

  const { mutate: update, isLoading: updating } = trpc.useMutation(
    ["users.update-profile"],
    {
      onSuccess: (data) => {
        // Overwrite auth session image to the newly uploaded image url.
        if (!!data?.image) session!.user.image = data.image;

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
        setIsOpen(false);
      },
      onError(error) {
        toast.error(error?.message);
      },
    }
  );

  const onSubmit = useCallback(
    async (values: UpdateUserInput) => {
      if (!!values?.avatar?.name) {
        const { avatar } = values;
        const { url, fields } = await createPresignedUrl({ userId });
        const formData = new FormData();

        Object.keys(fields).forEach((key) => {
          formData.append(key, fields[key]);
        });

        formData.append("Content-Type", avatar.type);
        formData.append("file", avatar);

        await fetch(url, {
          method: "POST",
          body: formData,
        });
      }

      const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_AVATARS_BUCKET_NAME}.s3.amazonaws.com/${userId}`;

      update({
        ...(values.name && {
          name: values.name,
        }),
        ...(values.bio && {
          bio: values.bio,
        }),
        ...(values.avatar && {
          image: imageUrl,
        }),
        userId: userId,
      });
    },
    [update, userId, createPresignedUrl]
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
      <div className="relative dark:bg-neutral-900 bg-white sm:p-12 p-8 flex items-center sm:w-[400px]">
        <ShouldRender if={!userInformation?.image}>
          <div className="absolute bg-emerald-600 -top-2 -right-2 z-10">
            <p className="text-white p-1 px-2">
              Tip: upload a profile picture!
            </p>
          </div>
        </ShouldRender>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-5"
          >
            <Avatar image={userInformation?.image} />

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
                Edit your account
              </h1>

              <p className="text-md leading-5 text-gray-600 dark:text-gray-500">
                Make your account your own.
              </p>
            </div>

            <Field
              error={errors.name}
              label="username"
              description={
                !userInformation?.name
                  ? "you have no username, you should add one!"
                  : undefined
              }
            >
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
              <p
                className={`absolute w-full text-right text-sm ${
                  bioLength > 160 ? "text-red-500" : "dark:text-neutral-400"
                }`}
              >
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
              disabled={!userInformation || updating}
            >
              Update
            </button>
          </form>
        </FormProvider>
      </div>
    </Modal>
  );
};

export default EditAccountModal;
