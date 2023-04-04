import Image from "next/future/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { IoExpandOutline } from "react-icons/io5";
import { MdClose, MdDownload, MdPause, MdAudiotrack } from "react-icons/md";
import { RiFileTextFill, RiPlayMiniFill } from "react-icons/ri";
import ShouldRender from "./ShouldRender";
import AudioPlayer from "./AudioPlayer";

export type MediaType = {
  name: string;
  url?: string;
  type: string;
};

type Props = {
  type: "media" | "document" | "audio";
  onClickImage?: () => void;
  file: MediaType;
  removeFile?: () => void;
  downloadable?: boolean;
};

const AttachmentPreview: React.FC<Props> = ({
  file,
  type,
  onClickImage,
  downloadable = false,
  removeFile,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioPlayingState = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = audioPlayingState;

  const onClickPlayAudio = useCallback(() => {
    setIsAudioPlaying((prev) => !prev);
  }, [setIsAudioPlaying]);

  const handleClickDownload = useCallback(() => {
    if (file?.url) {
      saveAs(file.url, file.name);
    }
  }, [file]);

  const isImage = file.type.includes("image");
  const isVideo = file.type.includes("video");

  const displayType = {
    media: isImage ? "Image" : "Video",
    document: "File",
    audio: "Audio",
  };

  useEffect(() => setIsAudioPlaying(false), [file, setIsAudioPlaying]);

  return (
    <div className="relative border border-zinc-300 bg-white p-4 first:mt-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-3">
        <div onClick={onClickImage} className="group relative h-16 w-16">
          <ShouldRender if={type === "document"}>
            <div className="flex h-16 w-16 items-center justify-center bg-emerald-500 dark:bg-emerald-700">
              <RiFileTextFill className="text-white" size={27} />
            </div>
          </ShouldRender>

          <ShouldRender if={type === "audio"}>
            <div className="group flex h-16 w-16 cursor-pointer items-center justify-center bg-emerald-500 dark:bg-emerald-700">
              <audio ref={audioRef} hidden src={file?.url} />
              <MdAudiotrack
                className="text-white  group-hover:hidden"
                size={27}
              />

              <button
                type="button"
                title={`${isAudioPlaying ? "Pause" : "Play"} the audio file`}
              >
                <ShouldRender if={!isAudioPlaying}>
                  <RiPlayMiniFill
                    className="hidden  text-white group-hover:block"
                    size={27}
                    onClick={onClickPlayAudio}
                  />
                </ShouldRender>

                <ShouldRender if={isAudioPlaying}>
                  <MdPause
                    className="hidden  text-white group-hover:block"
                    size={27}
                    onClick={onClickPlayAudio}
                  />
                </ShouldRender>
              </button>
            </div>
          </ShouldRender>

          <ShouldRender if={type === "media" && isImage}>
            <Image
              src={file?.url || "/static/default.jpg"}
              width={64}
              height={64}
              alt={file.name || "Uploaded image"}
              className="cursor-pointer transition-all group-hover:opacity-50 object-cover h-full"
            />
          </ShouldRender>

          <ShouldRender if={type === "media" && isVideo}>
            <div className="h-16 w-16">
              <video
                src={file?.url}
                width="100%"
                height="100%"
                className="h-full w-full cursor-pointer object-cover transition-all group-hover:opacity-50"
              />
            </div>
          </ShouldRender>

          <ShouldRender if={!!onClickImage}>
            <IoExpandOutline
              size={26}
              className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 cursor-pointer text-white group-hover:block"
            />
          </ShouldRender>
        </div>
        <div>
          <p className="mt-2 text-ellipsis text-sm text-neutral-700 line-clamp-2 dark:text-neutral-400">
            {file.name}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            {displayType[type] ?? "File"}
          </p>
        </div>
        <ShouldRender if={!!removeFile}>
          <MdClose
            size={20}
            role="button"
            title="Remove file"
            aria-label="Remove file"
            onClick={removeFile}
            className="absolute top-2 right-2 cursor-pointer text-neutral-700 transition-transform hover:scale-125 dark:text-neutral-300"
          />
        </ShouldRender>

        <ShouldRender if={downloadable}>
          <MdDownload
            size={30}
            role="button"
            title="Download file"
            aria-label="Download file"
            className="absolute top-1/2 right-4 -translate-y-1/2
          cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400"
            onClick={handleClickDownload}
          />
        </ShouldRender>
      </div>
      <ShouldRender if={type === "audio"}>
        <AudioPlayer
          audioRef={audioRef}
          playingState={audioPlayingState}
          src={file?.url}
        />
      </ShouldRender>
    </div>
  );
};

export default AttachmentPreview;
