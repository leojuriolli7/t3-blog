type Fields = Record<string, string>;

/**
 * This helper function takes the presigned url and fields provided by the AWS SDK, alongside
 * the file to be uploaded, and uploads it to the S3 bucket.
 */
export async function uploadFileToS3(url: string, fields: Fields, file: File) {
  const formData = new FormData();

  Object.keys(fields).forEach((key) => {
    formData.append(key, fields[key]);
  });

  formData.append("Content-Type", file.type);
  formData.append("file", file);

  await fetch(url, {
    method: "POST",
    body: formData,
  });
}
