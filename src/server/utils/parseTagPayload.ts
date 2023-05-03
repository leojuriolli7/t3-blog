import { CreateTagInput } from "@schema/tag.schema";

/**
 * This function is used to parse the tag payload before sending it to the server.
 * It will delete the payload's files, as they have already been uploaded and
 * will not be used on the server.
 */
export function parseTagPayload(tag: CreateTagInput) {
  if (tag?.avatarFile) delete tag.avatarFile;
  if (tag?.backgroundImageFile) delete tag.backgroundImageFile;

  return tag;
}
