import { useState } from 'react';
import { Button, Divider, Radio } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MenuIcon from '@mui/icons-material/Menu';
import ClearIcon from '@mui/icons-material/Clear';
import { v4 as uuidv4 } from 'uuid';

import styles from './ListReplyTemplate.module.css';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import ChatMessageType from '../ChatMessage/ChatMessageType/ChatMessageType';

interface ListReplyTemplateProps {
  title: string;
  body: string;
  globalButtons: Array<any>;
  items: Array<any>;
  onGlobalButtonClick: any;
  disabled?: boolean;
  component: any;
}

interface TemplateProps {
  title: string;
  body: string;
  globalButtonTitle: string;
  items: Array<any>;
}

interface SimulatorTemplateProps {
  title: string;
  body: string;
  globalButtonTitle: string;
  items: Array<any>;
  onGlobalButtonClick: any;
  disabled?: boolean;
  showHeader?: boolean;
  bspMessageId?: string;
}

interface ListTemplateProps {
  items: any;
  drawerTitle: string;
  disableSend?: boolean;
  onItemClick: any;
  onDrawerClose: any;
}

export const ChatTemplate = ({ title, body, globalButtonTitle, items }: TemplateProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [checkedItem, setCheckedItem] = useState<any>(null);

  let dialog;

  if (showDialog) {
    const list = items.map((item: any) => {
      const { options, title: listItemTitle } = item;
      return (
        <div className={styles.ListItemContainer} key={listItemTitle}>
          <div className={styles.ListItemTitle}>{listItemTitle}</div>
          {options.map((option: any) => (
            <Button
              key={option.title}
              className={styles.ListItemChat}
              onClick={() => setCheckedItem(option.title)}
            >
              <div>
                <div>{option.title}</div>
                <div>{option.description}</div>
              </div>
              <div>
                <Radio
                  value={option.title}
                  name="radio-list-item"
                  size="small"
                  checked={option.title === checkedItem}
                  color="primary"
                />
              </div>
            </Button>
          ))}
        </div>
      );
    });
    dialog = (
      <DialogBox
        title={globalButtonTitle}
        titleAlign="left"
        handleOk={() => setShowDialog(false)}
        buttonOk="Done"
        skipCancel
        alwaysOntop
      >
        <div className={styles.DialogContent}> {list}</div>
      </DialogBox>
    );
  }

  return (
    <div>
      <div className={styles.ChatTemplateBody}>
        <p>{title}</p>
        <p>{body}</p>
      </div>
      <div className={styles.ChatTemplateButton}>
        <Button
          variant="contained"
          startIcon={<MenuIcon />}
          onClick={() => setShowDialog(true)}
          className={styles.GlobalButton}
        >
          {globalButtonTitle}
        </Button>
      </div>
      {dialog}
    </div>
  );
};

export const SimulatorTemplate = ({
  title,
  body,
  globalButtonTitle,
  items,
  onGlobalButtonClick,
  disabled,
  showHeader = true,
  bspMessageId,
}: SimulatorTemplateProps) => (
  <div>
    <div className={styles.SimulatorContent}>
      {showHeader && <p className={styles.ListHeader}>{title}</p>}
      <ChatMessageType type="TEXT" body={body} isSimulatedMessage />
    </div>
    <Divider />
    <Button
      disabled={disabled}
      startIcon={<FormatListBulletedIcon />}
      onClick={() => onGlobalButtonClick({ items, bspMessageId })}
      className={styles.SimulatorButton}
    >
      {globalButtonTitle}
    </Button>
  </div>
);

export const ListReplyTemplateDrawer = ({
  items,
  drawerTitle,
  onItemClick,
  onDrawerClose,
  disableSend = false,
}: ListTemplateProps) => {
  const [checkedItem, setCheckedItem] = useState<any>(null);

  const handleItemClick = () => {
    onItemClick(checkedItem);
  };

  const list =
    items.items &&
    items.items.map((item: any, index: number) => {
      const { options, title: sectionTitle } = item;

      if (!sectionTitle) {
        return null;
      }

      return (
        <div key={uuidv4()}>
          <div className={styles.SectionTitle}>{sectionTitle}</div>
          <div className={styles.Options}>
            {options
              .map((option: any) => {
                const payloadObject = {
                  payload: {
                    type: 'list_reply',
                    title: option.title,
                    id: '',
                    reply: `${option.title} ${index + 1} `,
                    postbackText: option.postbackText ?? '',
                    description: option.description,
                  },
                  context: {
                    id: '',
                    gsId: items.bspMessageId,
                  },
                };

                if (option.title) {
                  return (
                    <Button
                      key={uuidv4()}
                      className={styles.ListItem}
                      onClick={() => setCheckedItem(payloadObject)}
                    >
                      <div className={styles.ListItemText}>
                        <div className={styles.ListItemTextTitle}>{option.title}</div>
                        <div>{option.description}</div>
                      </div>
                      <div>
                        <Radio
                          className={styles.ListItemRadio}
                          value={option.title}
                          name="radio-list-item"
                          size="small"
                          checked={checkedItem && option.title === checkedItem.payload.title}
                          color="primary"
                        />
                      </div>
                    </Button>
                  );
                }
                return null;
              })
              .filter((a: any) => a)}
          </div>
        </div>
      );
    });

  return (
    <div className={styles.Drawer}>
      <div className={styles.DrawerHeading}>
        <h3>{drawerTitle}</h3>
        <ClearIcon onClick={onDrawerClose} className={styles.DrawerCloseIcon} />
      </div>
      <div className={styles.List}>{list}</div>
      <div className={styles.SendButton}>
        <Button
          variant="contained"
          color="primary"
          disabled={!checkedItem || disableSend}
          onClick={handleItemClick}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export const ListReplyTemplate = ({
  globalButtons,
  component: TemplateComponent,
  ...rest
}: ListReplyTemplateProps) => {
  const globalButtonTitle = globalButtons?.length ? globalButtons[0].title : '';

  return <TemplateComponent globalButtonTitle={globalButtonTitle} {...rest} />;
};
