import type { Preview } from '@storybook/react-vite';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MemoryRouter } from 'react-router';
import { CssBaseline } from '@mui/material';
import theme from '../src/config/theme';
import '../src/i18n/config';
import '../src/index.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <CssBaseline />
              <Story />
            </LocalizationProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      source: {
        // React 19 changed the element marker to Symbol(react.transitional.element),
        // which Storybook's bundled react-element-to-jsx-string doesn't recognise.
        // The default 'dynamic' source serialises the rendered element and throws
        // "Objects are not valid as a React child" for stories with JSX args
        // (e.g. `children: <p>…</p>`). Forcing 'code' shows the static story source
        // from the CSF file instead, sidestepping the serialiser.
        type: 'code',
      },
    },
  },
};

export default preview;
