export const isAttachmentType = (type: "video" | "image", value: string) =>
  value.includes(type);
