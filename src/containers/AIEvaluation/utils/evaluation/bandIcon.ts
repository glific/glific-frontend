import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/** The mark a score carries wherever it is shown — the list, the run panel and the version picker. */
export const BAND_ICON = {
  good: CheckIcon,
  okay: WarningAmberIcon,
  bad: CloseIcon,
} as const;
