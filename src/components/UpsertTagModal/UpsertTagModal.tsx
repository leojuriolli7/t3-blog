import React, { useCallback, useEffect } from "react";
import Button from "@components/Button";
import { FormProvider, useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { CreateTagInput, createTagSchema } from "@schema/tag.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "../Field";
import { Modal } from "../Modal";
import TextInput from "../TextInput";
import { TagImageInput } from "./TagImageInput";
import { TagType } from "@utils/types";

type Props = {
  initialTag?: TagType | null;
  initialTagName?: string;
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  onFinish: (tag: CreateTagInput) => void;
};

export const UpsertTagModal: React.FC<Props> = ({
  initialTagName,
  initialTag,
  onFinish,
  openState,
}) => {
  const isUpdate = !!initialTag;
  const methods = useForm<CreateTagInput>({
    resolver: zodResolver(createTagSchema),
  });

  const [modalOpen, setModalOpen] = openState;

  const { errors } = methods.formState;
  const description = methods.watch("description");
  const values = methods.watch();
  const descriptionLength = description?.length || 0;

  const resetForm = useCallback(() => methods.reset(), [methods]);

  const onSubmit = useCallback(
    async (values: CreateTagInput) => {
      await onFinish(values);
      resetForm();

      setModalOpen(false);
    },
    [onFinish, setModalOpen, resetForm]
  );

  useEffect(() => {
    if (!isUpdate) {
      initialTagName && methods.setValue("name", initialTagName);
      methods.setValue("id", uuid());
    }

    if (isUpdate) {
      const validKeys = Object.keys(createTagSchema.strict().shape);
      type Key = "id" | "avatar" | "backgroundImage" | "name" | "description";

      for (const [key, value] of Object.entries(initialTag)) {
        if (validKeys.includes(key)) {
          methods.setValue(key as Key, value);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  return (
    <Modal onClose={resetForm} alwaysCentered openState={openState}>
      <div className="w-[400px] rounded-lg bg-white p-8 backdrop-blur-md dark:bg-zinc-900/70 sm:p-12">
        <h1 className=" text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
          {isUpdate ? `Update "${initialTag?.name}"` : "Create a new tag"}
        </h1>

        <FormProvider {...methods}>
          <form className="mt-3 flex flex-col gap-3">
            <Field required label="Tag name" error={errors.name}>
              <TextInput className="rounded-md" {...methods.register("name")} />
            </Field>

            <Field required label="Tag description" error={errors.description}>
              <TextInput
                className="h-24 rounded-md"
                textarea
                {...methods.register("description")}
              />
              <p
                className={`absolute w-full text-right text-sm ${
                  descriptionLength > 256
                    ? "text-red-500"
                    : "dark:text-neutral-400"
                }`}
              >
                {descriptionLength}/256
              </p>
            </Field>

            <div className="flex flex-col gap-6">
              <TagImageInput type="avatar" initialValue={initialTag?.avatar} />

              <TagImageInput
                type="banner"
                initialValue={initialTag?.backgroundImage}
              />
            </div>

            <Button
              type="button"
              // The submit function cannot be on the <form> tag because
              // it would trigger the parent (create post) form on click.
              onClick={methods.handleSubmit(onSubmit)}
              className="mt-6 flex w-full justify-center rounded-md"
            >
              {isUpdate ? "Update" : "Create"} tag
            </Button>
          </form>
        </FormProvider>
      </div>
    </Modal>
  );
};
