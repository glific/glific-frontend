export const getObject = (arr: any, data: any) => {
  const result: any = [];
  if (arr && data) {
    arr.forEach((obj: any) => {
      data.forEach((ID: any) => {
        if (obj.id === ID) result.push(obj);
      });
    });
  }
  return result;
};

export { getObject as default };
