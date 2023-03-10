import Image from "next/image";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { RiFileTextFill } from "react-icons/ri";
import { IoExpandOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type Props = {
  fileState: [File[], Dispatch<SetStateAction<File[]>>];
};

const AttachmentList: React.FC<Props> = ({ fileState }) => {
  const [files, setFiles] = fileState;
  const [parentRef] = useAutoAnimate();
  const [imagesParentRef] = useAutoAnimate();
  const [documentsParentRef] = useAutoAnimate();

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
        <div
          className="w-full flex flex-col gap-2 first:mt-4"
          ref={imagesParentRef}
        >
          {filteredAttachments?.images?.map((image, key) => (
            <div
              key={key}
              className="relative flex gap-3 p-4 bg-white border  border-zinc-300 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div
                onClick={onClickImage(image)}
                className="w-16 h-16 relative group"
              >
                <Image
                  src={image.url}
                  width={64}
                  height={64}
                  alt={image.name || "Uploaded image"}
                  objectFit="cover"
                  className="cursor-pointer transform group-hover:opacity-50 transition-all"
                />
                <IoExpandOutline
                  size={26}
                  className="text-white cursor-pointer hidden group-hover:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-400 mt-2 line-clamp-2 text-ellipsis">
                  {image.name}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                  Image
                </p>
              </div>
              <MdClose
                size={20}
                onClick={removeFile(image.name)}
                className="absolute top-2 right-2 cursor-pointer text-neutral-700 dark:text-neutral-300 transition-transform hover:transform hover:scale-125"
              />
            </div>
          ))}
          <p className="text-sm text-neutral-700 dark:text-neutral-400">
            Tip: Click the image to expand it.
          </p>
        </div>
      </ShouldRender>

      <ShouldRender if={filteredAttachments?.documents?.length}>
        {filteredAttachments?.documents?.map((document, key) => (
          <div
            key={key}
            ref={documentsParentRef}
            className="relative flex gap-3 p-4 bg-white border first:mt-4 border-zinc-300 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="bg-emerald-500 dark:bg-emerald-700 w-16 h-16 flex items-center justify-center">
              <RiFileTextFill className="text-white" size={27} />
            </div>
            <div>
              <p className="text-sm text-neutral-700 dark:text-neutral-400 mt-2 line-clamp-2 text-ellipsis">
                {document?.name || "Uploaded document"}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                File
              </p>
            </div>
            <MdClose
              size={20}
              onClick={removeFile(document.name)}
              className="absolute top-2 right-2 cursor-pointer text-neutral-700 dark:text-neutral-300 transition-transform hover:transform hover:scale-125"
            />
          </div>
        ))}
      </ShouldRender>

      <Modal openState={isMediaPreviewModalOpen}>
        <div>
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
