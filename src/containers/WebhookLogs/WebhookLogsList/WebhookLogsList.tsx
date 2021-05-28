import React, { useState } from 'react';
import { Popover } from '@material-ui/core';
import { useApolloClient } from '@apollo/client';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import styles from './WebhookLogsList.module.css';
import { ReactComponent as WebhookLogIcon } from '../../../assets/images/icons/Webhook/WebhookDark.svg';
import { ReactComponent as ViewIcon } from '../../../assets/images/icons/View.svg';
import CopyIcon from '../../../assets/images/icons/Copy.png';
import { List } from '../../List/List';
import { FILTER_WEBHOOK_LOGS, GET_WEBHOOK_LOGS_COUNT } from '../../../graphql/queries/WebhookLogs';
import Menu from '../../../components/UI/Menu/Menu';
import { Button } from '../../../components/UI/Form/Button/Button';
import { copyToClipboard } from '../../../common/utils';

export interface WebhookLogsListProps {}

const getTime = (time: string) => (
  <div className={styles.TableText}>{moment(time).format('DD-MM-YYYY hh:mm')}</div>
);

/* istanbul ignore next */
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
const webhookLogsIcon = <WebhookLogIcon className={styles.WebhookLogIcon} />;

const queries = {
  countQuery: GET_WEBHOOK_LOGS_COUNT,
  filterItemsQuery: FILTER_WEBHOOK_LOGS,
  deleteItemQuery: null,
};

const restrictedAction = () => ({ delete: false, edit: false });

export const WebhookLogsList: React.SFC<WebhookLogsListProps> = () => {
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<any>();
  const { t } = useTranslation();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
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
        title: t('Copy text'),
        icon: <img src={CopyIcon} alt="copy" />,
        onClick: () => {
          copyToClipboard(client, croppedtext);
        },
      },
      {
        title: t('View'),
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
        <span
          onClick={() => copyToClipboard(client, text)}
          aria-hidden="true"
          data-testid="copyToClipboard"
        >
          <img src={CopyIcon} alt="copy" />
          {t('Copy text')}
        </span>
        <Button variant="contained" color="default" onClick={handleClose}>
          {t('Done')}
        </Button>
      </div>
    </Popover>
  );
  return (
    <div className={styles.Container}>
      <List
        title={t('Webhook Logs')}
        listItem="webhookLogs"
        listItemName="webhookLog"
        pageLink="webhookLog"
        listIcon={webhookLogsIcon}
        searchParameter="url"
        button={{ show: false, label: '' }}
        {...queries}
        dialogMessage=""
        restrictedAction={restrictedAction}
        {...columnAttributes}
        removeSortBy={['STATUS']}
      />
      {popover}
    </div>
  );
};

export default WebhookLogsList;
