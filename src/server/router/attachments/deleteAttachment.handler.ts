import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@server/config/aws";
import { env } from "@env";
import { DeleteAttachmentInput } from "@schema/attachment.schema";

type DeleteAttachmentOptions = {
  input: DeleteAttachmentInput;
};

export const deleteAttachmentHandler = async ({
  input,
}: DeleteAttachmentOptions) => {
  const deleteAttachmentCommand = new DeleteObjectCommand({
    Bucket: env.AWS_S3_ATTACHMENTS_BUCKET_NAME,
    Key: input.key,
  });

  await s3.send(deleteAttachmentCommand);
};
