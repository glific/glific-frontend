import { DocumentNode, useQuery } from '@apollo/client';
import { IconButton } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LOADMORE_LIMIT } from 'common/constants';
import { copyToClipboard } from 'common/utils';
import SearchBar from 'components/UI/SearchBar/SearchBar';

import styles from './List.module.css';

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
  const [showLoadMore, setLoadMore] = useState(false);

  const { data, refetch, fetchMore } = useQuery(getItemsQuery, {
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
      if (data[listItemName].length > DEFAULT_ENTITY_LIMIT - 1) {
        setLoadMore(true);
      }
    },
  });

  const loadMoreItems = () => {
    const variables = {
      filter: {
        name: searchTerm,
      },
      opts: {
        limit: DEFAULT_MESSAGE_LOADMORE_LIMIT,
        offset: data[listItemName].length,
        order: 'DESC',
      },
    };

    fetchMore({
      variables,
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev; // If there's no new data, return the previous data

        if (fetchMoreResult[listItemName].length === 0) setLoadMore(false);

        // Merge the new items with the existing items
        const updatedItems = [...prev[listItemName], ...fetchMoreResult[listItemName]];

        // Return the updated data in the same shape as the original data
        return {
          ...prev,
          [listItemName]: updatedItems,
        };
      },
    });
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
                data-testid="listItem"
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
        {showLoadMore ? (
          <span onClick={loadMoreItems} className={styles.LoadMore}>
            Load More
          </span>
        ) : null}
      </div>
    </div>
  );
};
