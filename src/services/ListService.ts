export const setListSession = (sorting: string) => {
  localStorage.setItem('list_sorting', sorting);
};
export const getListSession = (listName?: string) => {
  const user = localStorage.getItem('list_sorting');
  // let's early if there is no user session on local
  if (!user) return null;

  // we should retun as requested

  const list: any = JSON.parse(user);

  const some = list.filter((name1: any) => name1.name === listName);

  if (some.length > 0) {
    return some[0].column;
  }
  return null;
};

export const getList = (listItemName: string, newVal: string) => {
  const some1: any = localStorage.getItem('list_sorting');

  let some: any = [];
  if (some1) {
    some = JSON.parse(some1);
  }
  const isThere = some.filter((hey: any) => {
    return hey.name === listItemName;
  });

  let final = [];
  if (isThere.length > 0) {
    final = some.map((hey: any) => {
      if (hey.name === listItemName) {
        return { name: hey.name, column: newVal };
      }
      return hey;
    });
  } else {
    final = [...some, { name: listItemName, column: newVal }];
  }

  return final;
};
