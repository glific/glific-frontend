export const updateObject = (oldObject: any, updateProperties: any) => {
  return {
    ...oldObject,
    ...updateProperties,
  };
};
