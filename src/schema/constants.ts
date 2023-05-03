import z from "zod";

/**
 * This schema uses the `File` instance, only available on the browser,
 * so this schema cannot be sent to the server. Any values being validated
 * by this need to be deleted before sending the payload to the server.
 */
export const fileSchema = z.custom<File>(
  (file) => {
    const isFile = file instanceof File;

    return isFile;
  },
  { message: "Invalid file" }
);
