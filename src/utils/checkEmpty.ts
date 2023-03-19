export const isStringEmpty = (value?: string) => {
  return value?.trim().length === 0 || !value;
};
