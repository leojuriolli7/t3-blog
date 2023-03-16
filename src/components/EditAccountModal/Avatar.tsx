import { UpdateUserInput } from "@schema/user.schema";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { MdAdd, MdOutlineAddAPhoto } from "react-icons/md";

type Props = {
  image?: string | null;
};

const Avatar: React.FC<Props> = ({ image }) => {
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    image || undefined
  );
  const { setValue } = useFormContext<UpdateUserInput>();

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];
    setValue("avatar", selectedFile || undefined);

    if (selectedFile) {
      setCurrentImage(URL.createObjectURL(selectedFile));
    }
  };

  useEffect(() => setCurrentImage(image), [image]);

  return (
    <>
      <div className="w-full flex justify-center items-center">
        <label htmlFor="avatar-file-input">
          <div className="w-fit mx-auto relative cursor-pointer flex items-center justify-center">
            <div className="group w-fit">
              <Image
                src={currentImage || "/static/default-profile.jpg"}
                width={128}
                height={128}
                alt="Your profile picture"
                className="rounded-full group-hover:brightness-50 dark:group-hover:opacity-50"
                objectFit="cover"
              />

              <MdAdd
                size={45}
                className="text-white cursor-pointer hidden group-hover:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>

            <div
              role="button"
              className="absolute bottom-0 right-0 p-2 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <MdOutlineAddAPhoto className="text-white" size={20} />
            </div>
          </div>
        </label>
      </div>

      <input
        type="file"
        className="hidden"
        id="avatar-file-input"
        accept="image/*"
        onChange={onFileChange}
      />
    </>
  );
};

export default Avatar;
