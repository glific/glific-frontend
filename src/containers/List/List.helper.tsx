import React from 'react';
import { Link } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
// import { useTranslation } from 'react-i18next';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { ReactComponent as PinIcon } from 'assets/images/icons/Pin/Inactive.svg';
import { ReactComponent as EditIcon } from 'assets/images/icons/Edit.svg';
import { getUserRolePermissions } from 'context/role';
import styles from './List.module.css';

const editIconLink = (id: string, pageLink: string, t: any) => (
  <Link to={`/${pageLink}/${id}/edit`}>
    <IconButton aria-label={t('Edit')} color="default" data-testid="EditIcon">
      <Tooltip title={t('Edit')} placement="top">
        <EditIcon />
      </Tooltip>
    </IconButton>
  </Link>
);

const additionalIconLink = (action: any, additionalActionParameter: any, key: any) => (
  <Link to={`${action.link}/${additionalActionParameter}`} key={key}>
    <IconButton color="default" className={styles.additonalButton} data-testid="additionalButton">
      <Tooltip title={`${action.label}`} placement="top">
        {action.icon}
      </Tooltip>
    </IconButton>
  </Link>
);

const actionDialogBtn = (action: any, additionalActionParameter: any, item: any, key: any) => (
  <IconButton
    color="default"
    data-testid="additionalButton"
    className={styles.additonalButton}
    id="additionalButton-icon"
    onClick={() => action.dialog(additionalActionParameter, item)}
    key={key}
  >
    <Tooltip title={`${action.label}`} placement="top" key={key}>
      {action.icon}
    </Tooltip>
  </IconButton>
);

const pinnedAreaSection = (
  <div className={styles.PinIcon}>
    <span className={styles.Keyword}>
      New contact <br /> flow
    </span>
    <Link to="/settings/organization">
      <PinIcon />
    </Link>
  </div>
);

const iconsSectionComponent = (
  allowedAction: any | null,
  listItems: any,
  item: any,
  deleteButton: Function,
  editButton: any | null,
  label: string,
  pinned: boolean,
  fetchQuery: any,
  additionalAction: Array<{
    icon: any;
    parameter: string;
    link?: string;
    dialog?: any;
    label?: string;
    button?: any;
  }> = []
) => {
  const userRolePermissions = getUserRolePermissions();
  return (
    <div className={styles.Icons}>
      {additionalAction.map((action: any, index: number) => {
        if (allowedAction.restricted) {
          return null;
        }
        // check if we are dealing with nested element
        let additionalActionParameter: any;
        const params: any = additionalAction[index].parameter.split('.');
        if (params.length > 1) {
          additionalActionParameter = listItems[params[0]][params[1]];
        } else {
          additionalActionParameter = listItems[params[0]];
        }
        const key = index;

        if (action.link) {
          return additionalIconLink(action, additionalActionParameter, key);
        }

        if (action.dialog) {
          return actionDialogBtn(action, additionalActionParameter, item, key);
        }
        if (action.button) {
          return action.button(listItems, action, key, fetchQuery);
        }
        return null;
      })}

      {/* do not display edit & delete for staff role in collection */}
      {userRolePermissions.manageCollections || listItems !== 'collections' ? (
        <>
          {editButton}
          {deleteButton(item.id, label)}
        </>
      ) : null}
      {pinned ? pinnedAreaSection : null}
    </div>
  );
};

// Reformat all items to be entered in table
const getIcons = (
  // id: number | undefined,
  item: any,
  label: string,
  isReserved: boolean | null,
  listItems: any,
  allowedAction: any | null,
  pinned: boolean,
  editSupport: boolean,
  editLink: Function,
  iconsSection: Function,
  deleteIconLink: Function
) => {
  // there might be a case when we might want to allow certain actions for reserved items
  // currently we don't allow edit or delete for reserved items. hence return early
  const { id } = item;
  if (isReserved) {
    return null;
  }
  let editButton = null;
  if (editSupport) {
    editButton = allowedAction.edit && editLink(id);
  }

  const deleteButton = (Id: any, text: string) =>
    allowedAction.delete ? deleteIconLink(Id, text) : null;

  if (id) {
    return iconsSection(allowedAction, listItems, item, deleteButton, editButton, label, pinned);
  }
  return null;
};

const formatList = (formatParams: any) => {
  const {
    listItems,
    restrictedAction,
    columns,
    pinned = false,
    editSupport,
    editIconLink: editLink,
    deleteIconLink,
    iconsSection: iconsArea,
  } = formatParams;

  return listItems.map(({ ...listItemObj }) => {
    const label = listItemObj.label ? listItemObj.label : listItemObj.name;
    const isReserved = listItemObj.isReserved ? listItemObj.isReserved : null;
    // display only actions allowed to the user
    const allowedAction = restrictedAction
      ? restrictedAction(listItemObj)
      : { chat: true, edit: true, delete: true };

    return {
      ...columns(listItemObj),
      operations: getIcons(
        listItemObj,
        label,
        isReserved,
        listItemObj,
        allowedAction,
        pinned,
        editSupport,
        editLink,
        iconsArea,
        deleteIconLink
      ),
      recordId: listItemObj.id,
    };
  });
};

export {
  additionalIconLink,
  actionDialogBtn,
  pinnedAreaSection,
  iconsSectionComponent,
  formatList,
  editIconLink,
};
