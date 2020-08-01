import React from 'react';
import styles from './ChatTemplates.module.css';
import { useQuery } from '@apollo/client';
import { List, ListItem, Divider, Paper, Typography } from '@material-ui/core';
import { FILTER_TEMPLATES } from '../../../../graphql/queries/Template';

interface ChatTemplatesProps {
  searchVal: string;
  handleSelectText(obj: any): void;
  isTemplate: boolean; // Will need to change if search won't be just by 'speed send' or 'template'.
}

export const ChatTemplates: React.SFC<ChatTemplatesProps> = (props) => {
  const filterVariables = () => {
    return {
      filter: {
        term: props.searchVal,
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
    let templateObjs = data.sessionTemplates;
    let text = props.isTemplate ? 'templates' : 'speed sends';
    let listItems = templateObjs.map((obj: any, index: number) => {
      if (obj.isHsm === props.isTemplate) {
        // True HSM === Template, False HSM === Speed send
        return (
          <div key={index}>
            <ListItem
              data-testid="list-item"
              button
              disableRipple
              onClick={(e: any) => props.handleSelectText(obj)}
              className={styles.PopperListItem}
            >
              <p className={styles.Text}>
                <b style={{ marginRight: '5px' }}>{obj.label}:</b>
                {obj.body}
              </p>
            </ListItem>
            <Divider light />
          </div>
        );
      }
    });

    return listItems.length !== 0 ? (
      <List className={styles.ShortcutList}>
        <Paper elevation={0} className={styles.Paper}>
          {listItems}
        </Paper>
      </List>
    ) : (
      <Typography data-testid="no-results" align="center" variant="h6">
        No {text} for that search.
      </Typography>
    );
  };

  return <div className={styles.ChatTemplates}>{popperItems()}</div>;
};

export default ChatTemplates;
