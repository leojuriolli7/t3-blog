import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import ShouldRender from "./ShouldRender";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import AttachmentPreview, { MediaType } from "./AttachmentPreview";
import PreviewMediaModal from "./PreviewMediaModal";

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

    const isMedia = (file: File) =>
      file.type.includes("image") || file.type.includes("video");

    const isAudio = (file: File) => file.type.includes("audio");

    return {
      medias: filesArray
        .filter((file) => isMedia(file))
        .map((image) => ({
          name: image.name,
          url: URL.createObjectURL(image) || "/static/default.jpg",
          type: image.type,
        })),
      audio: filesArray
        .filter((file) => isAudio(file))
        .map((audio) => ({
          name: audio.name,
          url: URL.createObjectURL(audio),
          type: audio.type,
        })),
      documents: filesArray.filter((file) => !isMedia(file) && !isAudio(file)),
    };
  }, [files]);

  const [currentMedia, setCurrentMedia] = useState<MediaType>();

  const onClickImage = useCallback(
    (image: MediaType) => () => {
      setCurrentMedia(image);
      setIsMediaPreviewModalOpen(true);
    },
    [setIsMediaPreviewModalOpen]
  );

  return (
    <div className="flex w-full flex-col gap-4" ref={parentRef}>
      <ShouldRender if={filteredAttachments?.medias?.length}>
        {filteredAttachments?.medias?.map((media, key) => (
          <AttachmentPreview
            file={media}
            type="media"
            key={key}
            onClickImage={onClickImage(media)}
            removeFile={removeFile(media.name)}
          />
        ))}
        <p className="-mt-2 text-sm text-neutral-700 dark:text-neutral-400">
          Tip: Click the video or image to expand it.
        </p>
      </ShouldRender>

      <ShouldRender if={filteredAttachments?.audio?.length}>
        {filteredAttachments?.audio?.map((audio, key) => (
          <AttachmentPreview
            file={audio}
            type="audio"
            key={key}
            removeFile={removeFile(audio.name)}
          />
        ))}
        <p className="-mt-2 text-sm text-neutral-700 dark:text-neutral-400">
          Tip: Play the audio by clicking it.
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

      <PreviewMediaModal
        media={currentMedia}
        openState={isMediaPreviewModalOpen}
      />
    </div>
  );
};

export default AttachmentList;
