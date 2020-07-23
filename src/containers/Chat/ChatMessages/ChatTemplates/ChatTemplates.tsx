import React from 'react';
import styles from './ChatTemplates.module.css';
import { useQuery } from '@apollo/client';
import { List, ListItem, Divider, Paper } from '@material-ui/core';
import { FILTER_TEMPLATES } from '../../../../graphql/queries/Template';
import Loading from '../../../../components/UI/Layout/Loading/Loading';

interface ChatTemplatesProps {
  searchVal: string;
  handleSelectText(obj: any): void;
}

export const ChatTemplates: React.SFC<ChatTemplatesProps> = (props) => {
  const filterVariables = () => {
    return {
      filter: {
        body: props.searchVal,
      },
      opts: {
        order: 'ASC',
      },
    };
  };
  const { loading, error, data } = useQuery<any>(FILTER_TEMPLATES, {
    variables: filterVariables(),
  });

  if (loading) return <div />;
  if (error || data.sessionTemplates === undefined) return <p>Error :(</p>;

  const popperItems = () => {
    // Make the API request.
    // Get the data for the selectedTab
    // selectedTab
    let templates = data.sessionTemplates;
    let listItems = templates.map((obj: any) => {
      return (
        <>
          <ListItem
            button
            disableRipple
            onClick={(e: any) => props.handleSelectText(obj)}
            className={styles.PopperListItem}
          >
            <b>{obj.label}: &nbsp;</b>
            {obj.body}
          </ListItem>
          <Divider light />
        </>
      );
    });

    return (
      <List className={styles.ShortcutList}>
        <Paper elevation={0} className={styles.Paper}>
          {listItems}
        </Paper>
      </List>
    );
  };

  return <div>{popperItems()}</div>;
};

export default ChatTemplates;
