import Image from "next/image";
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
    <div className="relative p-4 bg-white border first:mt-4 border-zinc-300 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-3">
        <div onClick={onClickImage} className="w-16 h-16 relative group">
          <ShouldRender if={type === "document"}>
            <div className="bg-emerald-500 dark:bg-emerald-700 w-16 h-16 flex items-center justify-center">
              <RiFileTextFill className="text-white" size={27} />
            </div>
          </ShouldRender>

          <ShouldRender if={type === "audio"}>
            <div className="bg-emerald-500 dark:bg-emerald-700 w-16 h-16 flex items-center justify-center group cursor-pointer">
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
                    className="text-white  group-hover:block hidden"
                    size={27}
                    onClick={onClickPlayAudio}
                  />
                </ShouldRender>

                <ShouldRender if={isAudioPlaying}>
                  <MdPause
                    className="text-white  group-hover:block hidden"
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
              objectFit="cover"
              className="cursor-pointer transform group-hover:opacity-50 transition-all"
            />
          </ShouldRender>

          <ShouldRender if={type === "media" && isVideo}>
            <div className="w-16 h-16">
              <video
                src={file?.url}
                width="100%"
                height="100%"
                className="cursor-pointer w-full h-full transform object-cover group-hover:opacity-50 transition-all"
              />
            </div>
          </ShouldRender>

          <ShouldRender if={!!onClickImage}>
            <IoExpandOutline
              size={26}
              className="text-white cursor-pointer hidden group-hover:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          </ShouldRender>
        </div>
        <div>
          <p className="text-sm text-neutral-700 dark:text-neutral-400 mt-2 line-clamp-2 text-ellipsis">
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
            className="absolute top-2 right-2 cursor-pointer text-neutral-700 dark:text-neutral-300 transition-transform hover:transform hover:scale-125"
          />
        </ShouldRender>

        <ShouldRender if={downloadable}>
          <MdDownload
            size={30}
            role="button"
            title="Download file"
            aria-label="Download file"
            className="absolute top-1/2 transform -translate-y-1/2
          right-4 cursor-pointer text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
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
