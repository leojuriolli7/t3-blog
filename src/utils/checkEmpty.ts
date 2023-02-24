export const isStringEmpty = (value?: string) => {
  return value?.trim().length === 0 || !value;
};

export const isObjectEmpty = (object: object) => {
  return Object.keys(object).length === 0 && object.constructor === Object;
};
