import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#119656',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#DD1F1F',
    },
  },
  typography: {
    fontFamily: ['heebo', 'sans-serif'].join(','),
  },
  overrides: {
    MuiTableSortLabel: {
      icon: {
        opacity: '0.7',
      },
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(147,162,155,0.84)',
      },
    },
    MuiButton: {
      contained: {
        backgroundColor: '#CACACA',
        '&:hover': {
          backgroundColor: '#b5b5b5',
        },
      },
      outlinedPrimary: {
        border: '2px solid',
        '&:hover': {
          border: '2px solid',
        },
      },
    },
    MuiTablePagination: {
      caption: {
        fontSize: '16px',
        color: '#073F24',
      },
    },
    MuiOutlinedInput: {
      notchedOutline: {
        borderRadius: '12px',
        borderWidth: '2px',
      },
    },
    MuiDialogActions: {
      root: {
        justifyContent: 'flex-start',
      },
    },
    MuiCssBaseline: {
      '@global': {
        // override the pseudo-classes
        '.Mui-disabled': { cursor: 'not-allowed !important' },
      },
    },

    MuiListItem: {
      root: {
        color: '073F24',
      },
    },
    MuiCheckbox: {
      root: {
        color: '#073f24',
        '&$checked': {
          color: '#119656',
        },
      },
    },
    MuiTableCell: {
      body: {
        color: 'unset',
      },
      head: {
        color: '#ccd4d0',
      },
    },
    MuiMenuItem: {
      root: {
        '&:hover': {
          backgroundColor: '#EDF6F2',
        },
      },
    },
    MuiTypography: {
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
});

export default theme;
