import { env } from "@env";
import { trpc } from "@utils/trpc";
import { useCallback } from "react";
import { generateS3Url } from "@utils/aws/generateS3Url";
import { uploadFileToS3 } from "@utils/aws/uploadFileToS3";

type Files = {
  avatar?: File;
  banner?: File;
};

/**
 * This helper hook will upload a tag avatar and/or banner to S3.
 */
export const useUploadTagImagesToS3 = () => {
  const { mutateAsync: createPresignedTagUrl } =
    trpc.attachments.createPresignedTagUrl.useMutation();

  const uploadTagImages = useCallback(
    async (tagName: string, filesToUpload: Files) => {
      const files = Object.values(filesToUpload).filter(
        (item) => item instanceof File
      );

      const fileUrls = await Promise.all(
        files?.map(async (file) => {
          const isAvatar = file === filesToUpload?.avatar;
          const type = isAvatar ? "avatar" : "background";

          const { url, fields } = await createPresignedTagUrl({
            tagName,
            type,
          });

          await uploadFileToS3(url, fields, file as File);
          const generatedUrl = generateS3Url(
            env.NEXT_PUBLIC_AWS_S3_TAG_IMAGES_BUCKET_NAME,
            `${tagName}/${type}`
          );

          // by adding a timestamp to the url, we ensure that the image cache is invalidated.
          const timestamp = new Date().getTime().toString();
          const stampedUrl = `${generatedUrl}?${timestamp}`;

          return {
            url: stampedUrl,
            type,
          };
        })
      );

      const uploadedAvatar = fileUrls.find((url) => url.type === "avatar");
      const uploadedBanner = fileUrls.find((url) => url.type === "background");

      const filteredUrls = {
        avatarUrl: uploadedAvatar?.url,
        backgroundUrl: uploadedBanner?.url,
      };

      return filteredUrls;
    },
    [createPresignedTagUrl]
  );

  return { uploadTagImages };
};
