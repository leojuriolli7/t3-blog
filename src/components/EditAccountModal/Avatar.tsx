import { UpdateUserInput } from "@schema/user.schema";
import Image from "@components/Image";
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

  useEffect(() => setCurrentImage(image || undefined), [image]);

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <label htmlFor="avatar-file-input">
          <div className="relative mx-auto flex w-fit cursor-pointer items-center justify-center">
            <div className="group w-fit">
              <Image
                src={currentImage || "/static/default-profile.jpg"}
                width={128}
                height={128}
                alt="Your profile picture"
                className="h-[128px] rounded-full object-cover group-hover:brightness-50 dark:group-hover:opacity-50"
              />

              <MdAdd
                size={45}
                className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform cursor-pointer text-white group-hover:block"
              />
            </div>

            <div
              role="button"
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-emerald-500 p-2 transition-colors hover:bg-emerald-600"
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
