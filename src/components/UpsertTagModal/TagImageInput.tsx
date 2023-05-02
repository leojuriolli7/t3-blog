import { ChangeEvent, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import AttachmentPreview from "@components/AttachmentPreview";
import Field from "@components/Field";
import PreviewMediaModal from "@components/PreviewMediaModal";
import { CreateTagInput } from "@schema/tag.schema";

type Props = {
  type: "avatar" | "banner";
  initialValue?: string;
};

export const TagImageInput: React.FC<Props> = ({ type, initialValue }) => {
  const methods = useFormContext<CreateTagInput>();
  const isAvatar = type === "avatar";
  const { errors } = methods.formState;

  const label = isAvatar ? "Tag avatar" : "Tag banner";
  const name = isAvatar ? "avatar" : "backgroundImage";

  const isMediaPreviewModalOpen = useState(false);
  const [, setIsMediaPreviewModalOpen] = isMediaPreviewModalOpen;

  const [currentImage, setCurrentImage] = useState<string | undefined>(
    initialValue || undefined
  );

  const removeImage = () => {
    methods.resetField(name);
    setCurrentImage(undefined);
  };

  const closePreviewModal = () => setIsMediaPreviewModalOpen(true);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];

    if (selectedFile) {
      methods.setValue(
        isAvatar ? "avatarFile" : "backgroundImageFile",
        selectedFile
      );

      const generatedImage = URL.createObjectURL(selectedFile);
      setCurrentImage(generatedImage);
      methods.setValue(name, generatedImage, {
        shouldValidate: true,
      });
    }
  };

  const currentFile = useMemo(
    () => ({
      name: `Selected ${isAvatar ? "avatar" : "banner"}`,
      url: currentImage,
      type: "image",
    }),
    [isAvatar, currentImage]
  );

  return (
    <Field required label={label} error={errors[name]}>
      {!currentImage && (
        <input
          type="file"
          accept="image/*"
          className="block w-full cursor-pointer rounded-md border border-gray-200 text-sm shadow-sm  file:mr-4 file:border-0 file:bg-gray-100 file:bg-transparent file:px-4 file:py-3 focus:z-10 focus:border-emerald-500 focus:ring-emerald-200 dark:border-neutral-800 dark:bg-zinc-900 dark:text-gray-400 dark:file:bg-gray-700 dark:file:text-gray-400"
          {...methods.register(name)}
          onChange={onFileChange}
        />
      )}

      <div className="-mt-4">
        {currentImage && (
          <>
            <AttachmentPreview
              compact
              file={currentFile}
              type="media"
              onClickImage={closePreviewModal}
              removeFile={removeImage}
            />

            <PreviewMediaModal
              media={currentFile}
              openState={isMediaPreviewModalOpen}
            />
          </>
        )}
      </div>
    </Field>
  );
};
