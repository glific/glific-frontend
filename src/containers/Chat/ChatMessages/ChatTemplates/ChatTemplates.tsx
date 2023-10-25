import { useQuery } from '@apollo/client';
import { List, ListItemButton, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import styles from './ChatTemplates.module.css';
import AttachmentIconUnselected from '../../../../assets/images/icons/Attachment/Attachment.svg?react';
import { FILTER_TEMPLATES } from '../../../../graphql/queries/Template';
import { WhatsAppToJsx } from '../../../../common/RichEditor';
import { setVariables } from '../../../../common/constants';
import { getInteractiveMessageBody } from '../../../../common/utils';
import { FILTER_INTERACTIVE_MESSAGES } from '../../../../graphql/queries/InteractiveMessage';

interface ChatTemplatesProps {
  searchVal: string;
  handleSelectText(obj: any, isInteractiveMsg: boolean): void;
  isTemplate: boolean; // Will need to change if search won't be just by 'speed send' or 'template'.
  isInteractiveMsg: boolean;
}

export const ChatTemplates = ({
  searchVal,
  handleSelectText,
  isTemplate,
  isInteractiveMsg,
}: ChatTemplatesProps) => {
  const { t } = useTranslation();

  const filterVariables = () => setVariables({ term: searchVal });
  const { loading, error, data } = useQuery<any>(FILTER_TEMPLATES, {
    variables: filterVariables(),
  });

  const { data: interactives } = useQuery<any>(FILTER_INTERACTIVE_MESSAGES, {
    fetchPolicy: 'network-only',
    variables: {
      filter: {
        label: searchVal,
      },
      opts: {},
    },
  });

  if (loading) return <div />;
  if (error || data.sessionTemplates === undefined) return <p>{t('Error :(')}</p>;

  const getListItem = (obj: any, index: number, interactiveMsg: boolean = false) => {
    const key = index;
    let tabListToShow;

    if (!interactiveMsg) {
      tabListToShow = obj.body;
    } else {
      const interactiveJSON = JSON.parse(obj.interactiveContent);
      tabListToShow = getInteractiveMessageBody(interactiveJSON);
    }

    return (
      <div key={key}>
        <ListItemButton
          data-testid="templateItem"
          disableRipple
          onClick={() => handleSelectText(obj, interactiveMsg)}
          className={`${styles.PopperListItem}`}
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
        </ListItemButton>
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
    const interactiveObj = interactives ? [...interactives.interactiveTemplates] : [];
    let text;
    let listItems;
    if (isTemplate) text = 'templates';
    else if (isInteractiveMsg) text = 'interactive msg';
    else text = 'speed sends';

    if (!isInteractiveMsg) {
      listItems = templateObj.map((obj: any, index: number) => {
        if (obj.isHsm === isTemplate) {
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
        getListItem(obj, index, isInteractiveMsg)
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
