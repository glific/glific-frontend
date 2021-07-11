import React from 'react';
import { useQuery } from '@apollo/client';
import { List, ListItem, Divider, Paper, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './ChatTemplates.module.css';
import { ReactComponent as AttachmentIconUnselected } from '../../../../assets/images/icons/Attachment/Attachment.svg';
import { FILTER_TEMPLATES } from '../../../../graphql/queries/Template';
import { WhatsAppToJsx } from '../../../../common/RichEditor';
import { setVariables } from '../../../../common/constants';
import { FILTER_INTERACTIVE_MSG } from '../../../../graphql/queries/InteractiveMsg';

interface ChatTemplatesProps {
  searchVal: string;
  handleSelectText(obj: any, isInteractiveMsg: boolean): void;
  isTemplate: boolean; // Will need to change if search won't be just by 'speed send' or 'template'.
  isInteractiveMsg: boolean;
}

export const ChatTemplates: React.SFC<ChatTemplatesProps> = (props) => {
  const { t } = useTranslation();
  const { searchVal } = props;

  const filterVariables = () => setVariables({ term: searchVal });
  const { loading, error, data } = useQuery<any>(FILTER_TEMPLATES, {
    variables: filterVariables(),
  });

  const { data: interactives } = useQuery<any>(FILTER_INTERACTIVE_MSG, {
    variables: {
      filter: {
        label: searchVal,
      },
    },
  });

  if (loading) return <div />;
  if (error || data.sessionTemplates === undefined) return <p>{t('Error :(')}</p>;

  const getListItem = (obj: any, index: number, isInteractiveMsg: boolean = false) => {
    const key = index;
    let tabListToShow;

    if (!isInteractiveMsg) {
      tabListToShow = obj.body;
    } else {
      const interactiveJSON = JSON.parse(obj.interactiveContent);
      if (interactiveJSON.type === 'list') {
        tabListToShow = interactiveJSON.body;
      } else if (interactiveJSON.type === 'quick_reply') {
        const { content } = interactiveJSON;
        switch (content.type) {
          case 'text':
            tabListToShow = content.text;
            break;
          case 'image':
            tabListToShow = content.caption;
            break;
          case 'video':
            tabListToShow = content.caption;
            break;
          case 'file':
            tabListToShow = content.filename;
            break;
          default:
            break;
        }
      }
    }

    return (
      <div key={key}>
        <ListItem
          data-testid="templateItem"
          button
          disableRipple
          onClick={() => props.handleSelectText(obj, isInteractiveMsg)}
          className={styles.PopperListItem}
        >
          <p className={styles.Text}>
            <b style={{ marginRight: '5px' }}>{obj.label}:</b>
            <span>{WhatsAppToJsx(tabListToShow)}</span>
          </p>
          {obj.MessageMedia ? (
            <div className={styles.AttachmentPin}>
              <AttachmentIconUnselected />
            </div>
          ) : null}
        </ListItem>
        <Divider light />
      </div>
    );
  };

  const popperItems = () => {
    const translationsObj: any = [];
    data.sessionTemplates.forEach((obj: any) => {
      const translations = JSON.parse(obj.translations);
      // add translation in list
      if (Object.keys(translations).length > 0) {
        Object.keys(translations).forEach((key) => {
          translationsObj.push(translations[key]);
        });
      }
    });

    const templateObj = [...data.sessionTemplates, ...translationsObj];
    const interactiveObj = interactives ? [...interactives.interactives] : [];
    let text;
    let listItems;
    if (props.isTemplate) text = 'templates';
    else if (props.isInteractiveMsg) text = 'ineractive msg';
    else text = 'speed sends';

    if (!props.isInteractiveMsg) {
      listItems = templateObj.map((obj: any, index: number) => {
        if (obj.isHsm === props.isTemplate) {
          // True HSM === Template, False HSM === Speed send
          // Display only active & APPROVED template
          if (obj.isHsm && obj.isActive && obj.status === 'APPROVED') {
            return getListItem(obj, index);
          }
          if (!obj.isHsm) {
            return getListItem(obj, index);
          }
        }
        return null;
      });
    } else {
      listItems = interactiveObj.map((obj: any, index: number) =>
        getListItem(obj, index, props.isInteractiveMsg)
      );
    }
    listItems = listItems.filter((n) => n);

    return listItems.length !== 0 ? (
      <List className={styles.ShortcutList}>
        <Paper elevation={0} className={styles.Paper}>
          {listItems}
        </Paper>
      </List>
    ) : (
      <Typography data-testid="no-results" align="center" variant="h6">
        {`No ${text} for that search.`}
      </Typography>
    );
  };

  return (
    <div className={styles.ChatTemplates} data-testid="chatTemplates">
      {popperItems()}
    </div>
  );
};

export default ChatTemplates;
