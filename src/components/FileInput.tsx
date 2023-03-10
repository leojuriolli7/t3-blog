import React, { useCallback, useRef, useState } from "react";
import Tag from "@components/Tag";
import { FieldType } from "@utils/types";
import { Controller, useFormContext } from "react-hook-form";
import ShouldRender from "./ShouldRender";
import AttachmentList from "./AttachmentList";
import Field from "./Field";
import { toast } from "react-toastify";

type Props = {
  control: any;
  name: string;
};

const FileInput: React.FC<Props> = ({ control, name }) => {
  const methods = useFormContext();
  const { formState } = methods;
  const { errors } = formState;
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);

  const handleChange = useCallback(
    (field: FieldType) => (newFiles: React.ChangeEvent<HTMLInputElement>) => {
      const newFilesArray = Array.from(
        newFiles?.target?.files?.length ? newFiles?.target?.files : []
      );
      const updatedFiles = [...files, ...newFilesArray];

      if (updatedFiles?.length > 4) {
        if (inputRef?.current?.value) {
          inputRef.current.value = "";
        }
        return toast.error("Maximum of 4 files per post");
      }

      setFiles(updatedFiles);
      field.onChange(updatedFiles);

      if (inputRef?.current?.value) {
        inputRef.current.value = "";
      }
    },
    [files]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <h2 className="text-2xl">Files & images</h2>
          <Field error={errors.files as any}>
            <input
              ref={inputRef}
              className="mt-2"
              type="file"
              multiple
              max={4}
              accept="image/*, .pdf, .docx, .txt, .msword, .doc"
              onChange={handleChange(field)}
            />
          </Field>

          <ShouldRender if={files?.length}>
            <AttachmentList files={files} />
          </ShouldRender>
        </div>
      )}
    />
  );
};

export default FileInput;
