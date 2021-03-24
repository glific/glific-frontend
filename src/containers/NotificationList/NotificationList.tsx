import React, { useState } from 'react';
import { Popover } from '@material-ui/core';
import { useApolloClient } from '@apollo/client';
import moment from 'moment';

import styles from './NotificationList.module.css';
import { ReactComponent as NotificationIcon } from '../../assets/images/icons/Notification/ErrorlogsDark.svg';
import { ReactComponent as ViewIcon } from '../../assets/images/icons/View.svg';
import CopyIcon from '../../assets/images/icons/Copy.png';
import { List } from '../List/List';
import { FILTER_NOTIFICATIONS, GET_NOTIFICATIONS_COUNT } from '../../graphql/queries/Notifications';
import Menu from '../../components/UI/Menu/Menu';
import { setNotification } from '../../common/notification';
import { Button } from '../../components/UI/Form/Button/Button';

export interface NotificationListProps {}

const getTime = (time: string) => (
  <div className={styles.TableText}>{moment(time).format('DD-MM-YYYY hh:mm')}</div>
);

const getText = (text: string) => <div className={styles.TableText}>{text}</div>;

const columnNames = ['TIME', 'CATEGORY', 'SEVERITY', 'ENTITY', 'MESSAGE'];
const dialogMessage = '';
const columnStyles = [styles.Time, styles.Category, styles.Severity, styles.Entity, styles.Message];
const tagIcon = <NotificationIcon className={styles.NotificationIcon} />;

const queries = {
  countQuery: GET_NOTIFICATIONS_COUNT,
  filterItemsQuery: FILTER_NOTIFICATIONS,
  deleteItemQuery: null,
};

const restrictedAction = () => ({ delete: false, edit: false });

export const NotificationList: React.SFC<NotificationListProps> = () => {
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

  const getCroppedText = (croppedtext: string) => {
    if (!croppedtext) {
      return <div className={styles.TableText}>NULL</div>;
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
          setText(croppedtext);
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
          {croppedtext.length > 25 ? `${croppedtext.slice(0, 25)}...` : croppedtext}
        </div>
      </Menu>
    );
  };

  const getColumns = ({ category, entity, message, severity, updatedAt }: any) => ({
    updatedAt: getTime(updatedAt),
    category: getText(category),
    severity: getText(severity),
    entity: getCroppedText(entity),
    message: getText(message),
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
        title="Notifications"
        listItem="notifications"
        listItemName="notification"
        pageLink="notifications"
        listIcon={tagIcon}
        searchParameter="message"
        button={{ show: false, label: '' }}
        dialogMessage={dialogMessage}
        {...queries}
        restrictedAction={restrictedAction}
        {...columnAttributes}
        removeSortBy={['ENTITY', 'SEVERITY', 'CATEGORY']}
      />
      {popover}
    </>
  );
};
