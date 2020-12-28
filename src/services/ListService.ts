// set session for list
export const setListSession = (sorting: string) => {
  localStorage.setItem('glific_config', sorting);
};

// returns the last sort diection or column for a particular list
export const getLastListSessionValues = (listName: string, isDirection: boolean) => {
  const listSort = localStorage.getItem('glific_config');
  // let's check early if there is no sort session on local
  if (!listSort) return null;

  // we should retun as requested
  const list: any = JSON.parse(listSort);

  const getListByName = list.filter((listItem: any) => listItem.name === listName);

  if (getListByName.length > 0) {
    if (isDirection) {
      return getListByName[0].direction;
    }
    return getListByName[0].column;
  }

  return null;
};

// return the updated list session with new values for direction and column name
export const getUpdatedList = (listItemName: string, newVal: string, isDirection: boolean) => {
  const listSorting: any = localStorage.getItem('glific_config');

  let finaList: any = [];
  // check if list already present
  if (listSorting) {
    finaList = JSON.parse(listSorting);
  }

  // check if current list name matches
  const isListNamePresent = finaList.filter((listItem: any) => {
    return listItem.name === listItemName;
  });

  if (isListNamePresent.length > 0) {
    finaList = finaList.map((listItem: any) => {
      // update column name for current list
      if (listItem.name === listItemName && !isDirection) {
        return {
          name: listItem.name,
          column: newVal,
          direction: listItem.direction ? listItem.direction : 'asc',
        };
      }
      // update direction for current list
      if (listItem.name === listItemName && isDirection) {
        return { name: listItem.name, column: listItem.column, direction: newVal };
      }
      return listItem;
    });
  } else {
    // add if not present in list
    finaList = [...finaList, { name: listItemName, column: newVal, direction: 'asc' }];
  }

  return finaList;
};

// clear the list sorting session from local storage
export const clearListSession = () => {
  localStorage.removeItem('glific_config');
};
