import { useLazyQuery } from '@apollo/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import DocumentIcon from 'assets/images/icons/Document/Light.svg?react';
import DownloadIcon from 'assets/images/icons/Download.svg?react';
import { setErrorMessage } from 'common/notification';
import { List } from 'containers/List/List';
import { COUNT_GOLDEN_QA, GET_GOLDEN_QA, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import styles from './GoldenQAList.module.css';

dayjs.extend(relativeTime);

interface GoldenQAListProps {
  searchQuery: string;
}

const columnStyles = [styles.TitleColumn, styles.DateColumn, styles.Actions];

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

const getGoldenQaErrors = (responseData: any): string[] => {
  const rootErrors = responseData?.goldenQa?.errors;
  const nestedErrors = responseData?.goldenQa?.goldenQa?.errors;
  const errors = Array.isArray(rootErrors) ? rootErrors : Array.isArray(nestedErrors) ? nestedErrors : [];

  return errors.map((errorItem) => {
    if (typeof errorItem === 'string') return errorItem;
    if (errorItem instanceof Error) return errorItem.message;
    if (typeof errorItem?.message === 'string') return errorItem.message;
    return String(errorItem);
  });
};

export const GoldenQAList = ({ searchQuery }: GoldenQAListProps) => {
  const [fetchGoldenQa] = useLazyQuery(GET_GOLDEN_QA);

  const getColumns = ({ name, insertedAt }: any) => ({
    name: (
      <div className={styles.TitleCell}>
        <DocumentIcon className={styles.DocumentIcon} />
        {name}
      </div>
    ),
    createdOn: dayjs(insertedAt).fromNow(),
  });

  const handleDownload = async (id: string) => {
    try {
      const { data, error } = await fetchGoldenQa({ variables: { id, includeSignedUrl: true } });

      if (error) {
        setErrorMessage(error);
        return;
      }

      const appErrors = getGoldenQaErrors(data);
      if (appErrors.length) {
        setErrorMessage(appErrors.join(', '));
        return;
      }

      const signedUrl = data?.goldenQa?.goldenQa?.signedUrl;
      if (signedUrl) {
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = ''; // Ensures download rather than opening in browser
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
      } else {
        setErrorMessage('Failed to generate download URL');
      }
    } catch (error) {
      setErrorMessage(error as Error);
    }
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
