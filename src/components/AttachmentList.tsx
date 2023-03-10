import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import AttachmentPreview from "./AttachmentPreview";

type Props = {
  fileState: [File[], Dispatch<SetStateAction<File[]>>];
};

const AttachmentList: React.FC<Props> = ({ fileState }) => {
  const [files, setFiles] = fileState;
  const [parentRef] = useAutoAnimate();

  const removeFile = useCallback(
    (fileName: string) => () => {
      const filteredFiles = files?.filter((file) => file.name !== fileName);

      setFiles(filteredFiles);
    },
    [files, setFiles]
  );

  const isMediaPreviewModalOpen = useState(false);
  const [, setIsMediaPreviewModalOpen] = isMediaPreviewModalOpen;

  const filteredAttachments = useMemo(() => {
    const filesArray = files || [];

    return {
      images: filesArray
        .filter((file) => file.type.includes("image"))
        .map((image) => ({
          name: image.name,
          url: URL.createObjectURL(image) || "/static/default.jpg",
          type: image.type,
        })),
      documents: filesArray.filter((file) => !file.type.includes("image")),
    };
  }, [files]);

  type ImageType = typeof filteredAttachments.images[number];

  const [currentImage, setCurrentImage] = useState<ImageType>();

  const onClickImage = useCallback(
    (image: ImageType) => () => {
      setCurrentImage(image);
      setIsMediaPreviewModalOpen(true);
    },
    [setIsMediaPreviewModalOpen]
  );

  return (
    <div className="w-full flex flex-col gap-4" ref={parentRef}>
      <ShouldRender if={filteredAttachments?.images?.length}>
        {filteredAttachments?.images?.map((image, key) => (
          <AttachmentPreview
            file={image}
            type="media"
            key={key}
            onClickImage={onClickImage(image)}
            removeFile={removeFile(image.name)}
          />
        ))}
        <p className="text-sm text-neutral-700 dark:text-neutral-400">
          Tip: Click the image to expand it.
        </p>
      </ShouldRender>

      <ShouldRender if={filteredAttachments?.documents?.length}>
        {filteredAttachments?.documents?.map((document, key) => (
          <AttachmentPreview
            file={document}
            type="document"
            key={key}
            removeFile={removeFile(document.name)}
          />
        ))}
      </ShouldRender>

      <Modal openState={isMediaPreviewModalOpen} alwaysCentered>
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage?.url || "/static/default.jpg"}
            alt={currentImage?.name}
            className="w-auto h-auto max-w-[60vw] max-h-[80vh]"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AttachmentList;
