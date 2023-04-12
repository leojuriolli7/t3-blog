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
          className="flex items-center justify-center w-full"
        >
          <label
            htmlFor="file"
            className={`flex flex-col mt-2 items-center justify-center w-full h-64 border-2 rounded-md border-dashed cursor-pointer bg-white dark:bg-neutral-900 ${
              isDragAccept ? "opacity-80 border-emerald-500" : ""
            } ${isDragReject ? "border-red-600" : ""} ${
              !isDragAccept && !isDragReject
                ? "dark:border-neutral-700 border-gray-300"
                : ""
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <HiOutlineCloudUpload
                aria-hidden="true"
                size={37}
                className={` mb-3 ${isDragAccept ? "text-emerald-500" : ""} ${
                  isDragReject ? "text-red-600" : ""
                } ${!isDragAccept && !isDragReject ? "text-gray-400" : ""}`}
              />

              <div>
                <p
                  className={`mb-2 text-sm text-center ${
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
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
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
