import { env } from "@env";
import { trpc } from "@utils/trpc";
import { useCallback } from "react";
import { generateS3Url } from "./generateS3Url";
import { uploadFileToS3 } from "./uploadFileToS3";

type Files = {
  avatar?: File;
  banner?: File;
};

/**
 * This helper function will upload a tag avatar or banner to S3.
 */
export const useUploadTagImageToS3 = () => {
  const { mutateAsync: createPresignedTagUrl } = trpc.useMutation(
    "attachments.create-presigned-tag-url"
  );

  const uploadTagImages = useCallback(
    async (tagName: string, filesToUpload: Files) => {
      const files = Object.values(filesToUpload).filter(
        (item) => item instanceof File
      );

      const fileUrls = await Promise.all(
        files?.map(async (file, index) => {
          const isAvatar = index === 0;
          const type = isAvatar ? "avatar" : "background";

          const { url, fields } = await createPresignedTagUrl({
            tagName,
            type,
          });

          await uploadFileToS3(url, fields, file as File);

          return generateS3Url(
            env.NEXT_PUBLIC_AWS_S3_TAG_IMAGES_BUCKET_NAME,
            `${tagName}/${type}`
          );
        })
      );

      const filteredUrls = {
        avatarUrl: fileUrls[0],
        backgroundUrl: fileUrls[1],
      };

      return filteredUrls;
    },
    [createPresignedTagUrl]
  );

  return { uploadTagImages };
};
