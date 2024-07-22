import { useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { CircularProgress, List, ListItemButton, Paper, Typography } from '@mui/material';
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
  selectedTab: string;
}

export const ChatTemplates = ({
  searchVal,
  handleSelectText,
  isTemplate,
  isInteractiveMsg,
  selectedTab,
}: ChatTemplatesProps) => {
  const { t } = useTranslation();

  const filterVariables = () => setVariables({ term: searchVal }, 50);
  const [getSessionTemplates, { loading, error, data }] = useLazyQuery<any>(FILTER_TEMPLATES);

  const [getInteractiveMessages, { data: interactives }] = useLazyQuery<any>(
    FILTER_INTERACTIVE_MESSAGES,
    {
      fetchPolicy: 'network-only',
    }
  );

  useEffect(() => {
    if (selectedTab === 'Templates') {
      getSessionTemplates({
        variables: {
          ...filterVariables(),
          isHsm: true,
        },
      });
    } else if (selectedTab === 'Interactive msg') {
      getInteractiveMessages({
        variables: {
          filter: {
            label: searchVal,
          },
          opts: {},
        },
      });
    } else {
      getSessionTemplates({
        variables: {
          ...filterVariables(),
          isHsm: false,
        },
      });
    }
  }, [searchVal, selectedTab]);

  if (loading)
    return (
      <div className={styles.Loading}>
        <CircularProgress size="20px" />
      </div>
    );
  if (error || data?.sessionTemplates === undefined) return <p>{t('Error :(')}</p>;

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
            <strong style={{ marginRight: '5px' }}>{obj.label}:</strong>
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
    const sessionTemplates = data?.sessionTemplates;

    sessionTemplates.forEach((obj: any) => {
      const translations = JSON.parse(obj.translations);
      // add translation in list
      if (Object.keys(translations).length > 0) {
        Object.keys(translations).forEach((key) => {
          translationsObj.push(translations[key]);
        });
      }
    });

    const templateObj = [...sessionTemplates, ...translationsObj];
    const interactiveObj = interactives ? [...interactives?.interactiveTemplates] : [];

    let listItems;

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
      <div className={styles.TemplateList}>
        <List className={styles.ShortcutList}>
          <Paper elevation={0} className={styles.Paper}>
            {listItems}
          </Paper>
        </List>
      </div>
    ) : (
      <Typography className={styles.NoResult} data-testid="no-results" align="center" variant="h6">
        {`No results found for the search.`}
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
