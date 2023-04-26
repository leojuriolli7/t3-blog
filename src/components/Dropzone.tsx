import React, { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { HiOutlineCloudUpload } from "react-icons/hi";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { UPLOAD_MAX_FILE_SIZE, UPLOAD_MAX_NUMBER_OF_FILES } from "@config/aws";
import convertToMegabytes from "@utils/convertToMB";
import AttachmentList from "./AttachmentList";
import Field from "./Field";

const Dropzone: React.FC = () => {
  const methods = useFormContext();
  const { formState } = methods;
  const { errors } = formState;
  const maxSizeInMB = convertToMegabytes(UPLOAD_MAX_FILE_SIZE);

  const filesState = useState<File[]>([]);
  const [files, setFiles] = filesState;

  const onDropRejected = (rejectedFile: FileRejection[]) => {
    const firstFileCode = rejectedFile[0]?.errors[0]?.code;
    if (firstFileCode === "file-too-large") {
      return toast.error(`Limit of ${maxSizeInMB}MB per file`);
    }

    if (firstFileCode === "too-many-files")
      return toast.error(
        `Maximum of ${UPLOAD_MAX_NUMBER_OF_FILES} files per post`
      );

    return toast.error("File type not supported");
  };

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      const newFilesArray = Array.from(
        acceptedFiles?.length ? acceptedFiles : []
      );
      const updatedFiles = [...files, ...newFilesArray];

      if (updatedFiles?.length > UPLOAD_MAX_NUMBER_OF_FILES)
        return toast.error(
          `Maximum of ${UPLOAD_MAX_NUMBER_OF_FILES} attachments per post`
        );

      setFiles(updatedFiles);

      methods.setValue("files", updatedFiles);
    },
    [files, setFiles, methods]
  );

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      onDropAccepted,
      onDropRejected,
      maxFiles: UPLOAD_MAX_NUMBER_OF_FILES,
      multiple: true,
      maxSize: UPLOAD_MAX_FILE_SIZE,
      noKeyboard: true,
      accept: {
        "image/*": [],
        "application/pdf": [".pdf"],
        "text/plain": [".txt"],
        "application/msword": [".doc"],
        "audio/wav": [".wav"],
        "audio/mpeg": [".mp3"],
        "video/mp4": [".mp4"],
      },
    });

  return (
    <div>
      <h2 className="text-2xl">Files & images</h2>
      <Field error={errors.files as any}>
        <div
          {...getRootProps({ onClick: (e) => e.preventDefault() })}
          className="flex w-full items-center justify-center"
        >
          <label
            htmlFor="file"
            className={`mt-2 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-white transition-colors hover:bg-zinc-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 ${
              isDragAccept ? "border-emerald-500 opacity-80" : ""
            } ${isDragReject ? "border-red-600" : ""} ${
              !isDragAccept && !isDragReject
                ? "border-gray-300 dark:border-neutral-700"
                : ""
            }`}
          >
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <HiOutlineCloudUpload
                aria-hidden="true"
                size={37}
                className={` mb-3 ${isDragAccept ? "text-emerald-500" : ""} ${
                  isDragReject ? "text-red-600" : ""
                } ${!isDragAccept && !isDragReject ? "text-gray-400" : ""}`}
              />

              <div>
                <p
                  className={`mb-2 text-center text-sm ${
                    isDragReject ? "text-red-600" : ""
                  } ${isDragAccept ? "text-emerald-500" : ""} ${
                    !isDragAccept && !isDragReject
                      ? "text-gray-500 dark:text-gray-400"
                      : ""
                  }`}
                >
                  <span className="font-bold">Click to upload</span> or drag and
                  drop
                </p>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Images, .pdf, .txt, .msword, .doc, .mp3, .wav, .mp4
                  <br />
                  <span>(Maximum of {maxSizeInMB}MB per file)</span>
                </p>
              </div>
            </div>
          </label>

          <input name="files" type="file" {...getInputProps()} />
        </div>
      </Field>

      <AttachmentList fileState={filesState} />
    </div>
  );
};

export default Dropzone;
