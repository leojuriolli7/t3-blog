import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { trpc } from "@utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import Field from "@components/Field";
import ShouldRender from "@components/ShouldRender";
import { useSession } from "next-auth/react";
import type { User } from "@utils/types";
import { UpdateUserInput, updateUserSchema } from "@schema/user.schema";
import { Modal } from "../Modal";
import Avatar from "./Avatar";
import UserLinkField from "./UserLink/UserLinkField";
import Button from "@components/Button";
import TextInput from "@components/TextInput";
import { useRouter } from "next/router";

type Props = {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  user?: User;
};

const EditAccountModal: React.FC<Props> = ({
  openState,
  user: userInformation,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
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
        if (!!data?.image && userId === session?.user?.id) {
          session!.user.image = data.image;
        }

        // Overwrite auth session name to the newly updated name.
        if (!!data?.name && userId === session?.user?.id) {
          session!.user.name = data.name;
        }

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
        userId,
        ...(values.name && {
          name: values.name,
        }),
        bio: values?.bio,
        ...(values.avatar && {
          image: imageUrl,
        }),
        url: values?.url || null,
      });
    },
    [update, userId, createPresignedUrl]
  );

  useEffect(() => {
    if (userInformation?.name && isOpen) {
      setValue("name", userInformation?.name);
      setValue("bio", userInformation?.bio || undefined);
      setValue("url", userInformation?.url || undefined);
    }

    if (userId) setValue("userId", userId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal openState={openState} alwaysCentered>
      <div className="relative flex items-center rounded-lg bg-white p-8 backdrop-blur-md dark:bg-zinc-900/70 sm:w-[400px] sm:p-12">
        <ShouldRender if={!userInformation?.image}>
          <div className="absolute -left-2 -top-2 z-10 rounded-md bg-emerald-600">
            <p className="p-1 px-2 text-white">
              Tip: upload a profile picture!
            </p>
          </div>
        </ShouldRender>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-5"
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
              <TextInput
                defaultValue={userInformation?.name || ""}
                type="text"
                placeholder="your username"
                className="rounded-md"
                {...register("name")}
              />
            </Field>

            <Field error={errors.bio} label="bio">
              <TextInput
                defaultValue={userInformation?.bio || ""}
                placeholder="your bio"
                className="h-24 rounded-md"
                textarea
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

            <UserLinkField initialLink={userInformation?.url} />

            <Field label="e-mail">
              <TextInput
                type="text"
                disabled
                placeholder="your email"
                className="rounded-md"
                defaultValue={userInformation?.email || ""}
              />
            </Field>

            <Button
              className="mx-auto mt-7 flex w-full min-w-fit justify-center rounded-lg px-8 py-2 hover:opacity-80"
              variant="primary"
              type="submit"
              disabled={!userInformation}
              loading={updating}
            >
              Update
            </Button>
          </form>
        </FormProvider>
      </div>
    </Modal>
  );
};

export default EditAccountModal;
