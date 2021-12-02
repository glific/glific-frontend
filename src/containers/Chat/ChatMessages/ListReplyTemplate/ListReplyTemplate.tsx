import React, { useState } from 'react';
import { Button, Radio } from '@material-ui/core';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import MenuIcon from '@material-ui/icons/Menu';
import ClearIcon from '@material-ui/icons/Clear';
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
  onGlobalButtonClick: any;
  disabled?: boolean;
  showHeader?: boolean;
}

interface ListTemplate {
  items: Array<any>;
  drawerTitle: string;
  disableSend?: boolean;
  onItemClick: any;
  onDrawerClose: any;
}

export const ChatTemplate: React.SFC<TemplateProps> = (props) => {
  const [showDialog, setShowDialog] = useState(false);
  const [checkedItem, setCheckedItem] = useState<any>(null);
  const { title, body, globalButtonTitle, items } = props;

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
          color="default"
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

export const SimulatorTemplate: React.SFC<TemplateProps> = (props) => {
  const {
    title,
    body,
    globalButtonTitle,
    items,
    onGlobalButtonClick,
    disabled,
    showHeader = true,
  } = props;
  return (
    <div className={styles.SimulatorContent}>
      {showHeader && <p className={styles.ListHeader}>{title}</p>}
      <ChatMessageType type="TEXT" body={body} isSimulatedMessage />
      <Button
        color="default"
        disabled={disabled}
        startIcon={<FormatListBulletedIcon />}
        onClick={() => onGlobalButtonClick(items)}
        className={styles.SimulatorButton}
      >
        {globalButtonTitle}
      </Button>
    </div>
  );
};

export const ListReplyTemplateDrawer: React.SFC<ListTemplate> = (props) => {
  const { items, drawerTitle, onItemClick, onDrawerClose, disableSend = false } = props;
  const [checkedItem, setCheckedItem] = useState<any>(null);

  const handleItemClick = () => {
    onItemClick(checkedItem);
  };

  const list = items.map((item: any) => {
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
              if (option.title) {
                return (
                  <Button
                    key={uuidv4()}
                    className={styles.ListItem}
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

export const ListReplyTemplate: React.SFC<ListReplyTemplateProps> = (props) => {
  const { globalButtons, component: TemplateComponent, ...rest } = props;
  const globalButtonTitle = globalButtons?.length ? globalButtons[0].title : '';

  return <TemplateComponent globalButtonTitle={globalButtonTitle} {...rest} />;
};
