import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TriggerIcon from 'assets/images/icons/Trigger/Union.svg?react';
import ClockIcon from 'assets/images/icons/Trigger/Clock.svg?react';
import ClockInactiveIcon from 'assets/images/icons/Trigger/Inactive.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import { TRIGGER_LIST_QUERY, TRIGGER_QUERY_COUNT } from 'graphql/queries/Trigger';
import { DELETE_TRIGGER } from 'graphql/mutations/Trigger';
import { EXTENDED_DATE_TIME_FORMAT_WITH_AMPM, LONG_DATE_FORMAT, dayList } from 'common/constants';
import { List } from 'containers/List/List';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './TriggerList.module.css';
import { triggerInfo } from 'common/HelpData';
import { useMutation } from '@apollo/client';
import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
dayjs.extend(relativeTime);

const getTooltip = (frequency: any, days: any) => {
  const obj: any = [];

  days.forEach((option: number) => {
    dayList.forEach((value: any) => {
      if (value.id === option) {
        obj.push(value.label.slice(0, 3));
      }
    });
  });
  return `Repeat: ${frequency}${frequency === 'weekly' ? `(${obj.toString()})` : ''}`;
};

const getName = ({ flow, startAt, frequency, days, isActive, nextTriggerAt }: any) => (
  <div className={styles.NameContainer}>
    <Tooltip title={getTooltip(frequency, days)} tooltipClass={styles.Tooltip} placement="right">
      <span className={styles.TriggerIcon}>{isActive ? <ClockIcon /> : <ClockInactiveIcon />}</span>
    </Tooltip>
    <div>
      <span className={styles.LabelText}>
        <span>{`${flow.name}_${dayjs(startAt).format(EXTENDED_DATE_TIME_FORMAT_WITH_AMPM)}`}</span>
      </span>
      <div className={styles.NextTrigger}>
        {isActive ? <>Next trigger {dayjs(nextTriggerAt).fromNow()}</> : 'Trigger in inactive'}
      </div>
    </div>
  </div>
);

const getEndDate = (date: any) => <div className={styles.EndDateVal}>{dayjs(date).format(LONG_DATE_FORMAT)}</div>;

const getCollections = (groups: any) => <div className={styles.Collection}>{groups && groups.join(', ')}</div>;

const getColumns = (columns: any) => {
  const { endDate, groups } = columns;
  return {
    name: getName(columns),
    startAt: getEndDate(endDate),
    collections: getCollections(groups),
  };
};

const columnStyles = [styles.Name, styles.EndDate, styles.Collections, styles.Actions];
const triggerIcon = <TriggerIcon className={styles.Icon} />;

const queries = {
  countQuery: TRIGGER_QUERY_COUNT,
  filterItemsQuery: TRIGGER_LIST_QUERY,
  deleteItemQuery: DELETE_TRIGGER,
};

export const TriggerList = () => {
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const setDialog = (id: any) => {
    navigate(`/trigger/${id}/edit`, { state: 'copy' });
  };
  const [deleteTrigger] = useMutation(DELETE_TRIGGER);
  const setDelete = (item: any) => {
    setCurrentItem(item);
    setDialogType('delete');
  };
  const handleEdit = (id: any) => {
    navigate(`/trigger/${id}/edit`);
  };

  const additionalAction = () => [
    {
      label: t('Copy'),
      icon: <DuplicateIcon data-testid="copy-icon" />,
      parameter: 'id',
      dialog: setDialog,
    },
    {
      label: t('Delete'),
      icon: <DeleteIcon />,
      parameter: 'id',
      dialog: setDelete,
    },
    {
      label: t('View'),
      icon: <ViewIcon />,
      parameter: 'id',
      dialog: handleEdit,
    },
  ];

  const columnNames: any = [
    { name: 'name', label: t('Title') },
    { name: 'updated_at', label: t('End date') },
    { label: t('Collections') },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const handleOk = async () => {
    if (dialogType === 'delete' && currentItem) {
      await deleteTrigger({
        variables: { id: currentItem.id },
      });
    }

    // Close dialog
    setDialogType(null);
    setCurrentItem(null);
  };
  let dialog = null;

  if (dialogType === 'delete') {
    dialog = (
      <DialogBox
        title="Do you want to delete this trigger?"
        handleOk={handleOk}
        handleCancel={() => {
          setCurrentItem(null);
          setDialogType(null);
        }}
        alignButtons="center"
      >
        <p className={styles.DialogText}>This trigger will be permanently deleted and cannot be used again.</p>
      </DialogBox>
    );
  }

  const dialogMessage = t("You won't be able to use this trigger.");

  return (
    <>
      {dialog}
      <List
        helpData={triggerInfo}
        title="Triggers"
        listItem="triggers"
        listItemName="trigger"
        pageLink="trigger"
        button={{ show: true, label: t('Create') }}
        listIcon={triggerIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        searchParameter={['name']}
        additionalAction={additionalAction}
        sortConfig={{ sortBy: 'updated_at', sortOrder: 'desc' }}
        restrictedAction={(item: any) => ({
          delete: false,
        })}
      />
    </>
  );
};

export default TriggerList;
