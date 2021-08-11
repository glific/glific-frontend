import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Checkbox, Popover, FormControlLabel } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { useApolloClient, useMutation } from '@apollo/client';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { ReactComponent as NotificationIcon } from 'assets/images/icons/Notification/Notification-dark-icon.svg';
import { ReactComponent as ViewIcon } from 'assets/images/icons/View.svg';
import CopyIcon from 'assets/images/icons/Copy.png';
import { List } from 'containers/List/List';
import Menu from 'components/UI/Menu/Menu';
import { Button } from 'components/UI/Form/Button/Button';
import { copyToClipboard } from 'common/utils';
import { FILTER_NOTIFICATIONS, GET_NOTIFICATIONS_COUNT } from 'graphql/queries/Notifications';
import MARK_NOTIFICATIONS_AS_READ from 'graphql/mutations/Notifications';
import styles from './NotificationList.module.css';

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
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<any>();
  const { t } = useTranslation();
  const history = useHistory();
  const [filters, setFilters] = useState<any>({
    Critical: true,
    Warning: false,
  });

  const reff = useRef(null);
  let filterValue: any = '';

  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ, {
    onCompleted: (data) => {
      if (data.markNotificationAsRead) {
        client.writeQuery({
          query: GET_NOTIFICATIONS_COUNT,
          variables: {
            filter: {
              is_read: false,
              severity: 'critical',
            },
          },
          data: { countNotifications: 0 },
        });
      }
    },
  });

  useEffect(() => {
    setTimeout(() => {
      markNotificationAsRead();
    }, 1000);
  }, []);

  const setDialog = (id: any, item: any) => {
    if (item.category === 'Message') {
      const chatID = JSON.parse(item.entity).id;
      history.push({ pathname: `/chat/${chatID}` });
    } else if (item.category === 'Flow') {
      const uuidFlow = JSON.parse(item.entity).flow_uuid;
      history.push({ pathname: `/flow/configure/${uuidFlow}` });
    } else {
      // this is item.category == Partner
      // need to figure out what should be done
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
        <div className={styles.CroppedText} data-testid="menu" ref={reff} aria-hidden="true">
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
  };

  const columnNames = ['', 'TIMESTAMP', 'CATEGORY', 'SEVERITY', 'ENTITY', 'MESSAGE'];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const popover = (
    <Popover open={open} anchorEl={reff.current} onClose={handleClose}>
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
    setFilters({ ...filters, [event.target.name]: event.target.checked });
  };

  const filterName = Object.keys(filters).filter((k) => filters[k] === true);
  if (filterName.length === 1) {
    [filterValue] = filterName;
  }

  const filterOnSeverity = (
    <div className={styles.Filters}>
      {severityList.map((label, index) => {
        const key = index;
        return (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={filters[label]}
                color="primary"
                onChange={handleCheckedBox}
                name={severityList[index]}
              />
            }
            label={severityList[index]}
            classes={{
              label: styles.FilterLabel,
            }}
          />
        );
      })}
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
        button={{ show: false }}
        dialogMessage=""
        {...queries}
        restrictedAction={restrictedAction}
        additionalAction={additionalAction}
        {...columnAttributes}
        removeSortBy={[t('Entity'), t('Severity'), t('Category')]}
        filters={{ severity: filterValue }}
        filterList={filterOnSeverity}
        listOrder="desc"
      />
      {popover}
    </div>
  );
};

export default NotificationList;
