import React, { useState } from 'react';
import {
  Toolbar,
  Typography,
  Popper,
  Fade,
  Paper,
  Button,
  ClickAwayListener,
} from '@material-ui/core';
import { SearchDialogBox } from '../../../../components/UI/SearchDialogBox/SearchDialogBox';
import { ReactComponent as ConfigureIcon } from '../../../../assets/images/icons/Configure/Configure.svg';
import { ReactComponent as AddContactIcon } from '../../../../assets/images/icons/Contact/Light.svg';
import { ReactComponent as BlockIcon } from '../../../../assets/images/icons/Block.svg';
import { Link } from 'react-router-dom';
import styles from './ContactBar.module.css';
import { useQuery } from '@apollo/client';
import { GET_GROUPS } from '../../../../graphql/queries/Group';

export interface ContactBarProps {
  contactName: string;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showDialog, setShowDialog] = useState(false);
  const groups = useQuery(GET_GROUPS);
  let options = [];

  if (groups.data) {
    options = groups.data.groups;
  }

  let dialogBox = null;

  const handleDialogOk = () => {
    setShowDialog(false);
  };

  if (showDialog) {
    dialogBox = (
      <SearchDialogBox
        title="Add contact to group"
        handleOk={handleDialogOk}
        handleCancel={handleDialogOk}
        options={options}
      ></SearchDialogBox>
    );
  }
  const popper = (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      transition
      className={styles.Popper}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper elevation={3} className={styles.Container}>
            <Button className={styles.ListButtonPrimary} onClick={() => setShowDialog(true)}>
              <AddContactIcon className={styles.Icon} />
              Add contact to group
            </Button>

            <br />
            <Link to={'/staff-management'} className={styles.Link}>
              <Button
                className={styles.ListButton}
                color="secondary"
                onClick={() => setAnchorEl(null)}
              >
                <BlockIcon className={styles.Icon} />
                Block Contact
              </Button>
            </Link>
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  const handleConfigureIconClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  return (
    <Toolbar className={styles.ContactBar} color="primary">
      <Typography className={styles.Title} variant="h6" noWrap data-testid="beneficiaryName">
        {props.contactName}
      </Typography>
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <div className={styles.Configure}>
          <ConfigureIcon onClick={handleConfigureIconClick} />
        </div>
      </ClickAwayListener>
      {popper}
      {dialogBox}
    </Toolbar>
  );
};

export default ContactBar;
