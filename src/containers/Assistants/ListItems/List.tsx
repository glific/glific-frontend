import { DocumentNode, useQuery } from '@apollo/client';
import { IconButton } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LOADMORE_LIMIT } from 'common/constants';
import { copyToClipboard } from 'common/utils';
import SearchBar from 'components/UI/SearchBar/SearchBar';

import styles from './List.module.css';
import { useNavigate } from 'react-router';

interface ListProps {
  getItemsQuery: DocumentNode;
  listItemName: string;
  currentId?: any;
  refreshList?: boolean;
  setCurrentId: any;
}

export const List = ({
  getItemsQuery,
  listItemName,
  refreshList,
  setCurrentId,
  currentId,
}: ListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoadMore, setLoadMore] = useState(false);
  const { t } = useTranslation();

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
      if (!currentId) setCurrentId(data[listItemName][0]?.id);
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
        if (!fetchMoreResult) return prev;

        if (fetchMoreResult[listItemName].length === 0) setLoadMore(false);

        const updatedItems = [...prev[listItemName], ...fetchMoreResult[listItemName]];

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
          handleSubmit={(e) => e.preventDefault()}
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
                onClick={() => navigate(`/assistants/${item.id}`)}
                data-testid="listItem"
              >
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
          <span data-testid="loadmore" onClick={loadMoreItems} className={styles.LoadMore}>
            {t('Load more')}
          </span>
        ) : null}
      </div>
    </div>
  );
};
