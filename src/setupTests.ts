import { vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

import.meta.env.VITE_WEB_SOCKET = 'ws://localhost/socket';

vi.mock('react-media-recorder', () => {
  return {
    useReactMediaRecorder: () => {
      return {
        status: 'idle',
        error: null,
        startRecording: () => {},
        stopRecording: () => {},
        mediaBlobUrl: () => {},
        clearBlobUrl: () => {},
      };
    },
  };
});

vi.mock('react-i18next', async () => {
  const reactI18next = await vi.importActual<any>('react-i18next');
  return {
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        t: (str: string) => str,
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      };
    },
    initReactI18next: reactI18next.initReactI18next,
  };
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;
window.HTMLDocument = Document;
window.fetch = vi.fn() as any;

global.URL.createObjectURL = vi.fn();

// fixes TextEncoder error while running tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
