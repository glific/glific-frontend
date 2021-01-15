import React, { useState } from 'react';
import { Popover } from '@material-ui/core';
import { useApolloClient } from '@apollo/client';
import moment from 'moment';

import styles from './WebhookLogsList.module.css';
import { ReactComponent as WebhookLogIcon } from '../../../assets/images/icons/Webhook/WebhookDark.svg';
import { ReactComponent as ViewIcon } from '../../../assets/images/icons/View.svg';
import CopyIcon from '../../../assets/images/icons/Copy.png';
import { List } from '../../List/List';
import { FILTER_WEBHOOK_LOGS, GET_WEBHOOK_LOGS_COUNT } from '../../../graphql/queries/WebhookLogs';
import Menu from '../../../components/UI/Menu/Menu';
import { setNotification } from '../../../common/notification';
import { Button } from '../../../components/UI/Form/Button/Button';

export interface TagListProps {}

const getTime = (time: string) => (
  <div className={styles.TableText}>{moment(time).format('DD-MM-YYYY hh:mm')}</div>
);

const getStatus = (status: string) => {
  let showStatus;
  switch (status) {
    case 'Success':
      showStatus = <div className={styles.Success}>{status}</div>;
      break;
    case 'Error':
      showStatus = <div className={styles.ErrorStyle}>{status}</div>;
      break;
    case 'Redirect':
      showStatus = <div className={styles.Redirect}>{status}</div>;
      break;
    case 'Undefined':
      showStatus = null;
      break;
    default:
      showStatus = status;
  }

  return <div className={styles.StatusContainer}>{showStatus}</div>;
};

const getText = (text: string) => <div className={styles.TableText}>{text}</div>;

const columnNames = [
  'TIME',
  'URL',
  'STATUS',
  'STATUS CODE',
  'ERROR',
  'METHOD',
  'REQUEST HEADER',
  'REQUEST JSON',
  'RESPONSE JSON',
];
const dialogMessage = "You won't be able to use this for tagging messages.";
const columnStyles = [
  styles.Time,
  styles.Url,
  styles.Status,
  styles.StatusCode,
  styles.Error,
  styles.Method,
  styles.Json,
  styles.Json,
  styles.Json,
];
const tagIcon = <WebhookLogIcon className={styles.WebhookLogIcon} />;

const queries = {
  countQuery: GET_WEBHOOK_LOGS_COUNT,
  filterItemsQuery: FILTER_WEBHOOK_LOGS,
  deleteItemQuery: null,
};

const restrictedAction = () => {
  return { delete: false, edit: false };
};

export const WebhookLogsList: React.SFC<TagListProps> = () => {
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<any>();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const copyToClipboard = (copiedText: any) => {
    navigator.clipboard.writeText(copiedText).then(() => {
      setNotification(client, 'Copied to clipboard');
    });
  };

  const getCroppedText = (croppedtext: string, isUrl: boolean = false) => {
    if (!croppedtext) {
      return <div className={styles.TableText}>NULL</div>;
    }

    let newtext = croppedtext;
    if (isUrl) {
      newtext = JSON.stringify(croppedtext);
    }

    const Menus = [
      {
        title: 'Copy text',
        icon: <img src={CopyIcon} alt="copy" />,
        onClick: () => {
          copyToClipboard(croppedtext);
        },
      },
      {
        title: 'View',
        icon: <ViewIcon />,
        onClick: () => {
          setText(newtext);
          setOpen(true);
        },
      },
    ];
    return (
      <Menu menus={Menus}>
        <div
          className={styles.CroppedText}
          onClick={handleClick}
          onKeyDown={handleClick}
          aria-hidden="true"
        >
          {newtext.length > 25 ? `${newtext.slice(0, 25)}...` : newtext}
        </div>
      </Menu>
    );
  };

  const getColumns = ({
    url,
    method,
    status,
    requestHeaders,
    requestJson,
    statusCode,
    responseJson,
    error,
    updatedAt,
  }: any) => ({
    updatedAt: getTime(updatedAt),
    url: getCroppedText(url, true),
    status: getStatus(status),
    statusCode: getText(statusCode),
    error: getCroppedText(error, true),
    method: getText(method),
    requestHeaders: getCroppedText(requestHeaders),
    requestJson: getCroppedText(requestJson),
    responseJson: getCroppedText(responseJson),
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
        <pre>{JSON.stringify(text ? JSON.parse(text) : '', null, 2)}</pre>
      </div>
      <div className={styles.PopoverActions}>
        <span onClick={() => copyToClipboard(text)} aria-hidden="true">
          <img src={CopyIcon} alt="copy" />
          Copy text
        </span>
        <Button variant="contained" color="default" onClick={handleClose}>
          Done
        </Button>
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
        removeSortBy={['STATUS']}
      />
      {popover}
    </>
  );
};
