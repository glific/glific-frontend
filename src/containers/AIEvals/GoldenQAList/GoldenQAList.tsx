import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import DocumentIcon from 'assets/images/icons/Document/Light.svg?react';
import DownloadIcon from 'assets/images/icons/Download.svg?react';
import { List } from 'containers/List/List';
import { COUNT_GOLDEN_QA, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import styles from './GoldenQAList.module.css';

dayjs.extend(relativeTime);

interface GoldenQAListProps {
  searchQuery: string;
}

const columnStyles = [styles.TitleColumn, styles.DateColumn, styles.Actions, styles.Icons];

const queries = {
  countQuery: COUNT_GOLDEN_QA,
  filterItemsQuery: LIST_GOLDEN_QA,
  deleteItemQuery: null,
};

const columnNames = [
  { label: 'Title' },
  { name: 'inserted_at', label: 'Created On', sort: true, order: 'desc' },
  { label: 'Actions' },
];

export const GoldenQAList = ({ searchQuery }: GoldenQAListProps) => {
  const getColumns = ({ name, insertedAt }: any) => ({
    name: (
      <div className={styles.TitleCell}>
        <DocumentIcon className={styles.DocumentIcon} />
        {name}
      </div>
    ),
    createdOn: dayjs(insertedAt).fromNow(),
  });

  const handleDownload = (_id: string, _item: any) => {
    // TODO: implement once backend provides a download endpoint for datasetId
  };

  const additionalAction = () => [
    {
      label: 'Download',
      icon: <DownloadIcon data-testid="download-icon" />,
      parameter: 'id',
      dialog: handleDownload,
    },
  ];

  return (
    <List
      title="Golden QA"
      listItem="goldenQas"
      listItemName="goldenQa"
      pageLink="golden-qa"
      {...queries}
      columnNames={columnNames}
      columns={getColumns}
      columnStyles={columnStyles}
      filters={searchQuery ? { name: searchQuery } : null}
      showHeader={false}
      showSearch={false}
      button={{ show: false }}
      editSupport={false}
      restrictedAction={() => ({ chat: false, edit: false, delete: false })}
      additionalAction={additionalAction}
      sortConfig={{ sortBy: 'inserted_at', sortOrder: 'desc' }}
      noItemText="Golden QA dataset"
    />
  );
};
