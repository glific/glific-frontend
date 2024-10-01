import { DocumentNode, useQuery } from '@apollo/client';
import styles from './List.module.css';
import SearchBar from 'components/UI/SearchBar/SearchBar';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import dayjs from 'dayjs';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import { IconButton } from '@mui/material';
import { copyToClipboard } from 'common/utils';
import { useEffect, useState } from 'react';
import { DEFAULT_ENTITY_LIMIT } from 'common/constants';

// const DEFAULT_ENTITY_LIMIT = 2;
interface ListProps {
  icon?: any;
  getItemsQuery: DocumentNode;
  listItemName: string;
  currentId?: any;
  refreshList?: boolean;
  setCurrentId: any;
}

export const List = ({
  icon,
  getItemsQuery,
  listItemName,
  refreshList,
  setCurrentId,
  currentId,
}: ListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, fetchMore, refetch } = useQuery(getItemsQuery, {
    variables: {
      filter: {
        name: searchTerm,
      },
      opts: {
        limit: DEFAULT_ENTITY_LIMIT,
        order: 'DESC',
      },
    },
    onCompleted: (data) => {
      setCurrentId(data[listItemName][0]?.id);
    },
  });

  const loadMoreItems = () => {
    const variables = {
      filter: {
        name: searchTerm,
      },
      opts: {
        limit: 4,
        order: 'DESC',
      },
    };
    fetchMore({ variables });
  };

  useEffect(() => {
    refetch();
  }, [refreshList]);

  return (
    <div className={styles.Container}>
      <div className={styles.Search}>
        <SearchBar
          handleChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onReset={() => setSearchTerm('')}
          searchMode
          iconFront
        />
      </div>
      <div className={styles.ListContainer}>
        {data &&
          data[listItemName] &&
          (data[listItemName].length === 0 ? (
            <div className={styles.NoItems}>No {listItemName} found!</div>
          ) : (
            data[listItemName].map((item: any) => (
              <div
                key={item.id}
                className={`${styles.Item} ${currentId === item.id ? styles.SelectedItem : ''}`}
                onClick={() => setCurrentId(item.id)}
              >
                {icon && <div>{icon}</div>}
                <div className={styles.Itemm}>
                  <div className={styles.Header}>
                    <span className={styles.Title}>{item.name}</span>
                    <span className={styles.Date}>
                      {dayjs(item.insertedAt).format('DD/MM/YY, HH:MM')}
                    </span>
                  </div>
                  <span className={styles.Id}>
                    <IconButton
                      data-testid="copyItemId"
                      onClick={() => copyToClipboard(item.itemId)}
                      edge="end"
                    >
                      <CopyIcon />
                    </IconButton>
                    {item.itemId}
                  </span>
                </div>
              </div>
            ))
          ))}
        {data && data[listItemName] && data[listItemName].length > DEFAULT_ENTITY_LIMIT - 1 ? (
          <span onClick={loadMoreItems} className={styles.LoadMore}>
            {' '}
            Load More
          </span>
        ) : null}
      </div>
    </div>
  );
};
