// Encode the user email to base64.
export const encode = (data: string) => {
  return Buffer.from(data, "utf-8").toString("base64");
};

export const decode = (data: string) => {
  return Buffer.from(data, "base64").toString("utf-8");
};
