import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Checkbox, Popover, FormControlLabel } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { useApolloClient, useMutation } from '@apollo/client';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import styles from './NotificationList.module.css';
import { ReactComponent as NotificationIcon } from '../../assets/images/icons/Notification/Unselected.svg';
import { ReactComponent as ViewIcon } from '../../assets/images/icons/View.svg';
import CopyIcon from '../../assets/images/icons/Copy.png';
import { List } from '../List/List';
import { FILTER_NOTIFICATIONS, GET_NOTIFICATIONS_COUNT } from '../../graphql/queries/Notifications';
import Menu from '../../components/UI/Menu/Menu';
import { Button } from '../../components/UI/Form/Button/Button';
import { copyToClipboard } from '../../common/utils';
import MARK_NOTIFICATIONS_AS_READ from '../../graphql/mutations/Notifications';

export interface NotificationListProps {}
const getDot = (isRead: boolean) => <div>{!isRead ? <div className={styles.Dot} /> : null}</div>;

const getTime = (time: string) => (
  <div className={styles.TableText}>{moment(time).format('DD-MM-YYYY hh:mm')}</div>
);

const getText = (text: string) => <div className={styles.TableText}>{text}</div>;

const columnStyles = [
  styles.Mark,
  styles.Time,
  styles.Category,
  styles.Severity,
  styles.Entity,
  styles.Message,
];
const notificationIcon = <NotificationIcon className={styles.NotificationIcon} />;

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
  const { t } = useTranslation();
  const history = useHistory();
  const [state, setState] = useState<any>({
    Critical: false,
    Warning: false,
  });
  let filterValue: any = '';

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const [markNotificationAsRead, { data }] = useMutation(MARK_NOTIFICATIONS_AS_READ, {});

  useEffect(() => {
    setTimeout(() => {
      if (!data) markNotificationAsRead();
    }, 1000);
  }, []);

  const setDialog = (id: any, item: any) => {
    if (item.category === 'Message') {
      const chatID = JSON.parse(item.entity).id;
      history.push({ pathname: `/chat/${chatID}` });
    } else {
      const uuidFlow = JSON.parse(item.entity).flow_uuid;
      history.push({ pathname: `/flow/configure/${uuidFlow}` });
    }
  };

  const additionalAction = [
    {
      icon: <ArrowForwardIcon className={styles.RedirectArrow} />,
      parameter: 'id',
      label: 'Check',
      dialog: setDialog,
    },
  ];
  const getCroppedText = (croppedtext: string) => {
    if (!croppedtext) {
      return <div className={styles.TableText}>NULL</div>;
    }

    const entityObj = JSON.parse(croppedtext);

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
          {entityObj.name ? (
            <span>
              Contact: {entityObj.name}
              <br />
              {croppedtext.slice(0, 25)}...
            </span>
          ) : (
            `${croppedtext.slice(0, 25)}...`
          )}
        </div>
      </Menu>
    );
  };

  const getColumns = ({ category, entity, message, severity, updatedAt, isRead }: any) => ({
    isRead: getDot(isRead),
    updatedAt: getTime(updatedAt),
    category: getText(category),
    severity: getText(severity.replace(/"/g, '')),
    entity: getCroppedText(entity),
    message: getText(message),
  });

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const columnNames = ['', 'TIMESTAMP', 'CATEGORY', 'SEVERITY', 'ENTITY', 'MESSAGE'];

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

  const severityList = ['Critical', 'Warning'];

  const handleCheckedBox = (event: any) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const keys = Object.keys(state).filter((k) => state[k] === true);
  if (keys.length === 1) {
    [filterValue] = keys;
  }

  const filterOnSeverity = (
    <div className={styles.filters}>
      {severityList.map((label, index) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={state[label]}
              color="primary"
              onChange={handleCheckedBox}
              name={severityList[index]}
            />
          }
          label={severityList[index]}
        />
      ))}
    </div>
  );
  return (
    <div>
      <List
        title="Notifications"
        listItem="notifications"
        listItemName="notification"
        pageLink="notifications"
        listIcon={notificationIcon}
        searchParameter="message"
        button={{ show: false, label: '' }}
        dialogMessage=""
        {...queries}
        restrictedAction={restrictedAction}
        additionalAction={additionalAction}
        {...columnAttributes}
        removeSortBy={[t('Entity'), t('Severity'), t('Category')]}
        filters={{ severity: filterValue }}
        filterList={filterOnSeverity}
      />
      {popover}
    </div>
  );
};

export default NotificationList;
