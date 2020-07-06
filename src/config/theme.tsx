import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#119656',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
  },
  typography: {
    fontFamily: ['heebo', 'sans-serif'].join(','),
  },
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(147,162,155,0.48)',
      },
    },
    MuiButton: {
      contained: {
        backgroundColor: '#CACACA',
        '&:hover': {
          backgroundColor: '#b5b5b5',
        },
      },
    },
  },
});

export default theme;
