import React from 'react';
import { GET_TAGS_COUNT, FILTER_TAGS } from '../../../graphql/queries/Tag';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import styles from './TagList.module.css';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';
import { ReactComponent as FilledTagIcon } from '../../../assets/images/icons/Tags/Filled.svg';
import { List } from '../../List/List';

export interface TagListProps {}

const getColumns = ({ label, description, keywords, colorCode }: any) => ({
  label: getLabel(label, colorCode),
  description: getDescription(description),
  keywords: getKeywords(keywords),
});

const getLabel = (label: string, colorCode: string) => (
  <div className={styles.LabelContainer}>
    <FilledTagIcon className={styles.FilledTagIcon} stroke={colorCode ? colorCode : '#0C976D'} />
    <p className={styles.LabelText} style={{ color: colorCode }}>
      {label}
    </p>
  </div>
);

const getDescription = (text: string) => <p className={styles.TableText}>{text}</p>;

const getKeywords = (keyword: any) => (
  <p className={styles.TableText}>{keyword ? keyword.join(', ') : null}</p>
);

const columnNames = ['TITLE', 'DESCRIPTION', 'KEYWORDS', 'ACTIONS'];
const dialogMessage = "You won't be able to use this for tagging messages.";
const columnStyles = [styles.Label, styles.Description, styles.Keywords, styles.Actions];
const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  countQuery: GET_TAGS_COUNT,
  filterItemsQuery: FILTER_TAGS,
  deleteItemQuery: DELETE_TAG,
};

const columnAttributes = {
  columnNames: columnNames,
  columns: getColumns,
  columnStyles: columnStyles,
};

export const TagList: React.SFC<TagListProps> = (props) => (
  <List
    title="Tags"
    listItem="tags"
    listItemName="tag"
    pageLink="tag"
    listIcon={tagIcon}
    button={{ show: true, label: '+ CREATE TAG' }}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
  />
);
