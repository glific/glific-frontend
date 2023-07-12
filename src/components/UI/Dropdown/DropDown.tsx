import { FormControl, IconButton, MenuItem, Select } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import styles from './DropDown.module.css';

type MyStateType = any;
export interface DropDownProps {
  selectedtag: MyStateType;
  setSelectedTag: React.Dispatch<React.SetStateAction<MyStateType>>;
  tag: any;
}

export const DropDown = ({ selectedtag, setSelectedTag, tag }: DropDownProps) => {
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <FormControl sx={{ marginLeft: 2 }}>
      <Select
        labelId="tag-dropdown-for-filter"
        displayEmpty
        value={selectedtag}
        onChange={(event) => {
          setSelectedTag({ id: event.target.value.id, label: event.target.value.label });
        }}
        MenuProps={MenuProps}
        className={styles.SearchBar}
        sx={{ '& > fieldset': { border: 'none' } }}
        endAdornment={
          selectedtag !== null && (
            <IconButton
              sx={{ visibility: 'visible', height: 8, width: 8, marginRight: 1 }}
              onClick={() => setSelectedTag(null)}
            >
              <ClearIcon />
            </IconButton>
          )
        }
        renderValue={(selected) => {
          if (selected === null) {
            return (
              <MenuItem disabled value="">
                Select Label
              </MenuItem>
            );
          }

          return selected.label;
        }}
        inputProps={selectedtag === null ? {} : { IconComponent: () => null }}
      >
        {tag &&
          tag.tags.map((data: any) => (
            <MenuItem key={data.id} value={data}>
              {data.label}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};
