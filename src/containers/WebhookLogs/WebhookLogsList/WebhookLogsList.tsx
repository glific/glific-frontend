import React, { useState } from 'react';
import { Popover } from '@material-ui/core';

import styles from './WebhookLogsList.module.css';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Dark.svg';
import { ReactComponent as ViewIcon } from '../../../assets/images/icons/View.svg';
import CopyIcon from '../../../assets/images/icons/Copy.png';
import { List } from '../../List/List';
import { FILTER_WEBHOOK_LOGS, GET_WEBHOOK_LOGS_COUNT } from '../../../graphql/queries/WebhookLogs';
import Menu from '../../../components/UI/Menu/Menu';

export interface TagListProps {}

// const getLabel = (label: string, colorCode: string = '#0C976D') => (
//   <div className={styles.LabelContainer}>
//     <FilledTagIcon className={styles.FilledTagIcon} stroke={colorCode} />
//     <p className={styles.LabelText} style={{ color: colorCode }}>
//       {label}
//     </p>
//   </div>
// );

const columnNames = [
  'TIME',
  'URL',
  'STATUS CODE',
  'ERROR',
  'METHOD',
  'REQUEST HEADER',
  'REQUEST JSON',
  'RESPONSE JSON',
];
const dialogMessage = "You won't be able to use this for tagging messages.";
const columnStyles = [
  styles.Label,
  styles.Label,
  styles.Label,
  styles.Label,
  styles.Label,
  styles.Description,
  styles.Keywords,
  styles.Actions,
];
const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  countQuery: GET_WEBHOOK_LOGS_COUNT,
  filterItemsQuery: FILTER_WEBHOOK_LOGS,
  deleteItemQuery: DELETE_TAG,
};

const restrictedAction = () => {
  return { delete: false, edit: true };
};

export const WebhookLogsList: React.SFC<TagListProps> = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const getDescription = (mytext: string) => {
    const finalText = mytext ? mytext.toString() : 'NULL';

    const Menus = [
      {
        title: 'Copy text',
        icon: <img src={CopyIcon} alt="copy" />,
        onClick: () => {
          // const dummy = document.createElement('input');
          // document.body.appendChild(dummy);

          // dummy.setAttribute('value', finalText);
          // console.log(dummy);
          // dummy.focus();
          // dummy.setSelectionRange(0, 10);
          // document.execCommand('copy');
          // document.body.removeChild(dummy);
          navigator.clipboard.writeText('dd').then(()=>{
            
          })
        },
      },
      {
        title: 'View',
        icon: <ViewIcon />,
        onClick: () => {
          setText(finalText);
          setOpen(true);
        },
      },
    ];
    return (
      <Menu menus={Menus}>
        <div
          className={styles.TableText}
          onClick={handleClick}
          onKeyDown={handleClick}
          aria-hidden="true"
        >
          {finalText.length > 25 ? `${finalText.slice(0, 25)}...` : finalText}
        </div>
      </Menu>
    );
  };

  const getColumns = ({
    url,
    method,
    requestHeaders,
    requestJson,
    statusCode,
    responseJson,
    error,
    updatedAt,
  }: any) => ({
    updatedAt: getDescription(updatedAt),
    url: getDescription(url),
    statusCode: getDescription(statusCode),
    error: getDescription(error),
    method: getDescription(method),
    requestHeaders: getDescription(requestHeaders),
    requestJson: getDescription(requestJson),
    responseJson: getDescription(responseJson),
  });

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const popover = (
    <Popover open={open} anchorEl={anchorEl} onClose={handleClose}>
      <div className={styles.PopoverText}>
        <pre>{JSON.stringify(text, null, 2)}</pre>
      </div>
    </Popover>
  );
  return (
    <>
      <List
        title="Webhook Logs"
        listItem="webhookLogs"
        listItemName="webhookLog"
        pageLink="webhookLog"
        listIcon={tagIcon}
        searchParameter="url"
        button={{ show: false, label: '' }}
        dialogMessage={dialogMessage}
        {...queries}
        restrictedAction={restrictedAction}
        {...columnAttributes}
      />
      {popover}
    </>
  );
};
