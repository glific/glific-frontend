import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem, Popover } from '@mui/material';
import { useState } from 'react';
import { formComponenets } from '../FormBuilder.helper';
import styles from './ContentSelector.module.css';

interface ContentSelectorProps {
  onSelectContent: (category: string, item: string) => void;
}

export const ContentSelector = ({ onSelectContent }: ContentSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const isOpen = Boolean(anchorEl);
  const isSubmenuOpen = Boolean(submenuAnchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    handleSubmenuClose();
  };

  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleCategoryHover = (event: any, categoryName: string) => {
    setSubmenuAnchorEl(event.currentTarget);
    setSelectedCategory(categoryName);
  };

  const handleSelectItem = (category: string, item: string) => {
    onSelectContent(category, item);
    handleClose();
  };

  const selectedCategoryData = formComponenets.find((cat) => cat.name === selectedCategory);

  return (
    <div className={styles.ContentSelector}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClick}
        className={styles.AddContentButton}
      >
        Add Content
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              mt: 0.5,
            },
          },
        }}
      >
        {formComponenets.map((category) => (
          <MenuItem
            key={category.name}
            onMouseEnter={(e) => handleCategoryHover(e, category.name)}
            selected={selectedCategory === category.name}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>{category.icon}</ListItemIcon>
            <ListItemText>{category.name}</ListItemText>
            <ChevronRightIcon fontSize="small" sx={{ ml: 2, color: 'text.secondary' }} />
          </MenuItem>
        ))}
      </Menu>

      <Popover
        open={isSubmenuOpen}
        anchorEl={submenuAnchorEl}
        onClose={handleSubmenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            onMouseEnter: () => {},
            sx: {
              minWidth: 200,
              pointerEvents: 'auto',
            },
          },
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
        }}
      >
        {selectedCategoryData?.children.map((item) => (
          <MenuItem
            key={item.name}
            onClick={() => handleSelectItem(selectedCategoryData.name, item.name)}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.name}</ListItemText>
          </MenuItem>
        ))}
      </Popover>
    </div>
  );
};
