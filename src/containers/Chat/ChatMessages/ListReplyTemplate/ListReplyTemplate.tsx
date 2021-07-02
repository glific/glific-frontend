import React, { useState } from 'react';
import { Button, Radio } from '@material-ui/core';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import ClearIcon from '@material-ui/icons/Clear';

import styles from './ListReplyTemplate.module.css';

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
}

interface ListTemplate {
  items: Array<any>;
  drawerTitle: string;
  onItemClick: any;
  onDrawerClose: any;
}

export const ChatTemplate: React.SFC<TemplateProps> = (props) => {
  const { title, body, globalButtonTitle, items, onGlobalButtonClick, disabled } = props;

  return (
    <div className={styles.ChatTemplate}>
      <div className={styles.ChatTemplateBody}>
        <p>{title}</p>
        <p>{body}</p>
      </div>
      <div className={styles.ChatTemplateButton}>
        <Button
          variant="contained"
          color="default"
          disabled={disabled}
          startIcon={<FormatListBulletedIcon />}
          onClick={() => onGlobalButtonClick(items)}
          className={styles.GlobalButton}
        >
          {globalButtonTitle}
        </Button>
      </div>
    </div>
  );
};

export const SimulatorTemplate: React.SFC<TemplateProps> = (props) => {
  const { title, body, globalButtonTitle, items, onGlobalButtonClick, disabled } = props;

  return (
    <div>
      <p>{title}</p>
      <p>{body}</p>
      <hr />
      <Button
        color="default"
        disabled={disabled}
        startIcon={<FormatListBulletedIcon />}
        onClick={() => onGlobalButtonClick(items)}
        className={styles.GlobalButton}
      >
        {globalButtonTitle}
      </Button>
    </div>
  );
};

export const ListReplyTemplateDrawer: React.SFC<ListTemplate> = (props) => {
  const { items, drawerTitle, onItemClick, onDrawerClose } = props;
  const [checkedItem, setCheckedItem] = useState<any>(null);

  const handleItemClick = () => {
    onItemClick(checkedItem);
  };

  const list = items.map((item: any) => {
    const { title, options } = item;
    return (
      <div key={title}>
        <div className={styles.ListTitle}>{title}</div>
        {/* Options */}
        <div>
          {options.map((option: any) => (
            <Button
              key={option.title}
              className={styles.ListItem}
              onClick={() => setCheckedItem(option.title)}
            >
              <div>{option.title}</div>
              <div>
                <Radio
                  value={option.title}
                  name="radio-list-item"
                  checked={option.title === checkedItem}
                />
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className={styles.Drawer}>
      <div className={styles.DrawerHeading}>
        {drawerTitle}
        <ClearIcon onClick={onDrawerClose} />
      </div>
      <div className={styles.List}>{list}</div>
      <div className={styles.SendButton}>
        <Button
          variant="contained"
          color="primary"
          disabled={!checkedItem}
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
