import { useEffect, useState, useRef } from 'react';
import { Popover, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useApolloClient, useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import NotificationIcon from 'assets/images/icons/Notification/Notification-dark-icon.svg?react';
import ViewIcon from 'assets/images/icons/View.svg?react';
import CopyIcon from 'assets/images/icons/Copy.png';
import { List } from 'containers/List/List';
import Menu from 'components/UI/Menu/Menu';
import { Button } from 'components/UI/Form/Button/Button';
import { copyToClipboard } from 'common/utils';
import { FILTER_NOTIFICATIONS, GET_NOTIFICATIONS_COUNT } from 'graphql/queries/Notifications';
import MARK_NOTIFICATIONS_AS_READ from 'graphql/mutations/Notifications';
import styles from './NotificationList.module.css';

const getDot = (isRead: boolean) => <div>{!isRead ? <div className={styles.Dot} /> : null}</div>;

const getTime = (time: string) => (
  <div className={styles.TableText}>{dayjs(time).format('DD-MM-YYYY hh:mm')}</div>
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

export const NotificationList = () => {
  const client = useApolloClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<any>();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<any>('');

  const navigate = useNavigate();

  const menuRef = useRef(null);

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
      navigate(`/chat/${chatID}`);
    } else if (item.category === 'Flow') {
      const uuidFlow = JSON.parse(item.entity).flow_uuid;
      navigate(`/flow/configure/${uuidFlow}`);
    } else {
      // this is item.category == Partner
      // need to figure out what should be done
    }
  };

  const additionalAction = () => [
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
          copyToClipboard(croppedtext);
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
          data-testid="NotificationRowMenu"
          ref={menuRef}
          aria-hidden="true"
        >
          {entityObj.name ? (
            <span>
              Name: {entityObj.name}
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

  const columnNames = [
    { label: '' },
    { name: 'updated_at', label: t('Timestamp'), sort: true, order: 'desc' },
    { label: t('Category') },
    { label: t('Severity') },
    { label: t('Entity') },
    { name: 'message', label: t('Message') },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const popover = (
    <Popover open={open} anchorEl={menuRef.current} onClose={handleClose}>
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

  const severityList = ['Critical', 'Warning', 'Info', 'All'];

  const filterOnSeverity = (
    <div className={styles.Filters}>
      <RadioGroup
        aria-label="template-type"
        name="template-type"
        row
        value={filter}
        onChange={(event) => {
          const { value } = event.target;
          setFilter(value);
        }}
      >
        {severityList.map((label) => (
          <div className={styles.RadioLabelWrapper} key={label}>
            <FormControlLabel
              value={label === 'All' ? '' : label}
              control={<Radio color="primary" />}
              classes={{ root: styles.RadioLabel }}
              label={label}
              data-testid="radio"
            />
          </div>
        ))}
      </RadioGroup>
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
        searchParameter={['message']}
        button={{ show: false }}
        dialogMessage=""
        {...queries}
        restrictedAction={restrictedAction}
        additionalAction={additionalAction}
        {...columnAttributes}
        filters={{ severity: filter }}
        filterList={filterOnSeverity}
      />
      {popover}
    </div>
  );
};

export default NotificationList;
