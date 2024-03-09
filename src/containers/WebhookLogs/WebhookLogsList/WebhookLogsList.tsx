import { useState } from 'react';
import { Popover } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import WebhookLogIcon from 'assets/images/icons/Webhook/WebhookDark.svg?react';
import ViewIcon from 'assets/images/icons/View.svg?react';
import CopyIcon from 'assets/images/icons/Copy.png';
import { List } from 'containers/List/List';
import Menu from 'components/UI/Menu/Menu';
import { Button } from 'components/UI/Form/Button/Button';
import { FILTER_WEBHOOK_LOGS, GET_WEBHOOK_LOGS_COUNT } from 'graphql/queries/WebhookLogs';
import { copyToClipboard, slicedString } from 'common/utils';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import styles from './WebhookLogsList.module.css';

const getTime = (time: string) => (
  <div className={styles.TableText}>{dayjs(time).format(STANDARD_DATE_TIME_FORMAT)}</div>
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

export const WebhookLogsList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<any>();
  const { t } = useTranslation();

  const columnNames = [
    { name: 'updated_at', label: t('Time'), sort: true, order: 'desc' },
    { name: 'url', label: t('URL') },
    { label: t('Status') },
    { name: 'status_code', label: t('Status Code') },
    { name: 'error', label: t('Error') },
    { name: 'method', label: t('Method') },
    { name: 'request_headers', label: t('Request header') },
    { name: 'request_json', label: t('Request JSON') },
    { name: 'response_json', label: t('Response JSON') },
  ];

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
          copyToClipboard(croppedtext);
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
          {slicedString(newtext, 21)}
        </div>
      </Menu>
    );
  };

  const getColumns = ({
    updatedAt,
    url,
    status,
    statusCode,
    error,
    method,
    requestHeaders,
    requestJson,
    responseJson,
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
          onClick={() => copyToClipboard(text)}
          aria-hidden="true"
          data-testid="copyToClipboard"
        >
          <img src={CopyIcon} alt="copy" />
          {t('Copy text')}
        </span>
        <Button variant="contained" onClick={handleClose}>
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
        searchParameter={['contact_phone', 'url']}
        button={{ show: false }}
        {...queries}
        showActions={false}
        dialogMessage=""
        restrictedAction={restrictedAction}
        {...columnAttributes}
      />
      {popover}
    </div>
  );
};

export default WebhookLogsList;
