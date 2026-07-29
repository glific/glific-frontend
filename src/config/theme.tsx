import { createTheme } from '@mui/material/styles';
import { COLOR_BRAND_PRIMARY, COLOR_BRAND_SECONDARY, COLOR_ERROR, COLOR_WARNING } from 'config/tokens';

const theme = createTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: COLOR_BRAND_PRIMARY,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    error: {
      main: COLOR_ERROR,
    },
    warning: {
      main: COLOR_WARNING,
    },
    secondary: {
      main: COLOR_BRAND_SECONDARY,
    },
  },
  typography: {
    fontFamily: ['heebo', 'sans-serif'].join(','),
  },
  components: {
    MuiTableSortLabel: {
      styleOverrides: {
        icon: {
          opacity: '0.7',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          height: '32px',
          minHeight: '32px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          height: '32px',
          minHeight: '32px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'var(--app-color-gray-secondary)',
          boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { padding: '12px' },
      },
    },

    MuiTablePagination: {
      styleOverrides: {
        selectLabel: {
          fontSize: '1rem',
          color: 'var(--app-color-text-primary)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderRadius: '12px',
          borderWidth: '2px',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '32px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          justifyContent: 'flex-start',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          // override the pseudo-classes
          '.Mui-disabled': { cursor: 'not-allowed !important' },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: { color: 'var(--app-color-text-primary)' },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          color: 'var(--app-color-text-primary)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'var(--app-color-text-primary)',
          '&.Mui-checked': {
            color: 'var(--app-color-brand-primary)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        body: {
          color: 'unset',
        },
        head: {
          color: 'var(--app-color-green-quaternary)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'var(--app-color-surface-hover)',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h5: {
          '@media (max-width:768px)': {
            fontSize: '1rem',
          },
        },
        h6: {
          '@media (max-width:768px)': {
            fontSize: '1rem',
          },
        },
      },
    },
  },
});

export default theme;
