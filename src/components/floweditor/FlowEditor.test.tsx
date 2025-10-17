import { BrowserRouter as Router } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import * as FlowEditorHelper from './FlowEditor.helper';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';

import { FlowEditor } from './FlowEditor';
import {
  getActiveFlow,
  getInactiveFlow,
  getFlowWithoutKeyword,
  getOrganizationServicesQuery,
  publishFlow,
  getFreeFlow,
  resetFlowCount,
  getFlowTranslations,
  getTemplateFlow,
  getFlowWithManyKeywords,
  exportFlow,
} from 'mocks/Flow';
import { conversationQuery } from 'mocks/Chat';
import {
  messageReceivedSubscription,
  messageSendSubscription,
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription,
  simulatorSearchQuery,
} from 'mocks/Simulator';
import { GET_FREE_FLOW, GET_FLOW_DETAILS } from 'graphql/queries/Flow';
import * as Notification from 'common/notification';
import * as Apollo from '@apollo/client';
import * as Utils from 'common/utils';

window.location = { assign: vi.fn() } as any;
window.location.reload = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { reload: vi.fn() },
  });
});

vi.mock('react-router', async () => {
  return {
    ...(await vi.importActual<any>('react-router')),
    useParams: () => ({ uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676' }),
  };
});

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('../simulator/Simulator', () => ({
  default: ({ message }: { message: string }) => <div data-testid="simulator">{message}</div>, // Mocking the component's behavior
}));

const mocks = [
  messageReceivedSubscription({ organizationId: null }),
  messageSendSubscription({ organizationId: null }),
  conversationQuery,
  simulatorReleaseSubscription({ organizationId: null }),
  simulatorReleaseQuery,
  simulatorGetQuery,
  simulatorGetQuery,
  simulatorSearchQuery,
  simulatorSearchQuery,
  publishFlow,
  getOrganizationServicesQuery,
  getFreeFlow,
  getFreeFlow,
  getFlowTranslations,
  exportFlow,
];

const activeFlowMocks = [...mocks, getActiveFlow];
const inActiveFlowMocks = [...mocks, getInactiveFlow];
const noKeywordMocks = [...mocks, getFlowWithoutKeyword, resetFlowCount];
const templateFlowMocks = [...mocks, getTemplateFlow, resetFlowCount];
const manyKeywordsMocks = [...mocks, getFlowWithManyKeywords, resetFlowCount];

const wrapperFunction = (mocks: any) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <FlowEditor />
    </Router>
  </MockedProvider>
);

declare global {
  interface Window {
    showFlowEditor: any;
  }
}
window.showFlowEditor = (node: any, config: any) => vi.fn();

const defaultWrapper = wrapperFunction(activeFlowMocks);

test('it should display the flowEditor', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { container } = render(defaultWrapper);
  await waitFor(() => {
    expect(container.querySelector('#flow')).toBeInTheDocument();
  });
});

test('it should have a back button that redirects to flow page', async () => {
  const { getByTestId } = render(defaultWrapper);
  await waitFor(() => {
    expect(getByTestId('back-button')).toBeInTheDocument();
  });
});

test('it should display name of the flow', async () => {
  const { getByTestId } = render(defaultWrapper);
  await waitFor(() => {
    expect(getByTestId('flowName')).toBeInTheDocument();
  });
});

// test('it should have a help button that redirects to help page', async () => {
//   const { getByTestId } = render(defaultWrapper);
//   await waitFor(() => {
//     expect(getByTestId('helpButton')).toBeInTheDocument();
//   });
// });

test('it should have a preview button', async () => {
  const { getByTestId } = render(defaultWrapper);
  await waitFor(() => {
    expect(getByTestId('translateButton')).toBeInTheDocument();
    expect(getByTestId('previewButton')).toBeInTheDocument();
  });
});

// test('it should have save as draft button', async () => {
//   const { getByTestId } = render(defaultWrapper);
//   await waitFor(() => {
//     expect(getByTestId('saveDraftButton')).toBeInTheDocument();
//   });
// });

// test('check if someone else is using a flow', async () => {
//   // onload is not defined for script element in vite so we need to trigger it manually
//   const mockCreateElement = document.createElement.bind(document);
//   let scriptElements: any = [];
//   document.createElement = function (tags: any, options: any) {
//     if (tags === 'script') {
//       const mockScriptElement = mockCreateElement('script');
//       scriptElements.push(mockScriptElement);
//       return mockScriptElement;
//     } else return mockCreateElement(tags, options);
//   };

//   render(defaultWrapper);

//   await waitFor(() => {
//     expect(screen.findByText('help workflow'));
//   });

//   await waitFor(() => {
//     scriptElements[1].onload();
//   });

//   await waitFor(() => {
//     expect(screen.getByText('The flow is being edited by NGO Main Account')).toBeInTheDocument();
//   });

//   fireEvent.click(getByText('Go Back'));
// });

test('publish flow which has error', async () => {
  const { getByTestId } = render(defaultWrapper);

  await waitFor(() => {
    expect(getByTestId('button')).toBeInTheDocument();
    fireEvent.click(getByTestId('button'));

    expect(getByTestId('ok-button')).toBeInTheDocument();
    fireEvent.click(getByTestId('ok-button'));
  });
});

// Need to add appropriate mocks for these calls

// test('test if XMLHTTPRequest works ', async () => {
//   const { getByTestId } = render(defaultWrapper);
//   fireEvent.click(getByTestId('previewButton'));

//   const newRequest = new XMLHttpRequest();
//   newRequest.open('GET', 'www.glific.org');
//   newRequest.send();
//   await waitFor(() => {
//     expect(newRequest.readyState).toBe(4);
//   });
// });

// test('fetch api calls', async () => {
//   render(defaultWrapper);
//   const tokenExpiryDate = new Date();
//   tokenExpiryDate.setDate(new Date().getDate() + 1);

//   setAuthSession(
//     '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' +
//       tokenExpiryDate +
//       '"}'
//   );
//   fetch('https://glific.test')
//     .then((response) => response.json())
//     .then((data) => console.log(data));
// });

test('start with a keyword message if the simulator opens in floweditor screen', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(defaultWrapper);

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });

  fireEvent.click(screen.getByTestId('previewButton'));

  await waitFor(() => {
    expect(screen.getByTestId('simulator')).toHaveTextContent('draft:help');
  });
});

test.skip('if the flow the inactive', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(wrapperFunction(inActiveFlowMocks));

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });
  fireEvent.click(screen.getByTestId('previewButton'));
  await waitFor(() => {
    expect(screen.findByTestId('simulator-container'));
  });

  await waitFor(() => {
    expect(screen.getByTestId('simulator')).toHaveTextContent('Sorry, the flow is not active');
  });
});

test('flow with no keywords', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(wrapperFunction(noKeywordMocks));

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });
  fireEvent.click(screen.getByTestId('previewButton'));

  await waitFor(() => {
    expect(screen.getByTestId('simulator')).toHaveTextContent('No keyword found');
  });
});

test('reset flow counts', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId, getByText } = render(wrapperFunction(noKeywordMocks));

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });

  fireEvent.click(getByTestId('moreButton'));
  fireEvent.click(getByText('Reset flow count'));
  await waitFor(() => {
    expect(
      getByText(
        'Please be careful, this cannot be undone. Once you reset the flow counts you will lose tracking of how many times a node was triggered for users.'
      )
    ).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('ok-button'));

  await waitFor(() => {
    expect(window.location.reload).toHaveBeenCalled();
  });
});

test('it translates the flow', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { getByTestId, getByText } = render(defaultWrapper);

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });

  fireEvent.click(screen.getByTestId('translateButton'));
  fireEvent.click(getByTestId('cancel-button'));

  fireEvent.click(screen.getByTestId('translateButton'));

  await waitFor(() => {
    expect(getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('ok-button'));

  fireEvent.keyDown(getByText('Note'), { key: 'Esc', code: 'Esc' });
  fireEvent.click(getByTestId('ok-button'));

  await waitFor(() => {
    expect(getByText('Note')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Continue'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('template words should have template: prefix', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(wrapperFunction(templateFlowMocks));

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });
  fireEvent.click(screen.getByTestId('previewButton'));

  await waitFor(() => {
    expect(screen.getByTestId('simulator')).toHaveTextContent('template:help workflow');
  });
});

test('if keywords are more than 8 it should be shown in a tooltip', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(wrapperFunction(manyKeywordsMocks));

  await waitFor(() => {
    expect(screen.findByText('help, activity, preference, optout, stop, start, end, yes + 2 more'));
  });
});

test('should export the flow', async () => {
  const exportSpy = vi.spyOn(Utils, 'exportFlowMethod');
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(defaultWrapper);

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });

  fireEvent.click(screen.getByTestId('moreButton'));
  fireEvent.click(screen.getByText('Export flow'));

  await waitFor(() => {
    expect(exportSpy).toHaveBeenCalled();
  });
});

test('should open the share responder dialog box', async () => {
  render(defaultWrapper);

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });

  fireEvent.click(screen.getByTestId('moreButton'));
  fireEvent.click(screen.getByText('Share Responder Link'));

  await waitFor(() => {
    expect(screen.getByTestId('dialogHeading')).toHaveTextContent('Share Responder Link');
  });
});

test('should show warning when no keywords are present and share responder link is clicked', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  render(wrapperFunction(noKeywordMocks));

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });

  fireEvent.click(screen.getByTestId('moreButton'));
  fireEvent.click(screen.getByText('Share Responder Link'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('should display read-only banner when flow is being edited by another user', async () => {
  mockedAxios.post.mockResolvedValue({ data: {} });

  const loadfilesSpy = vi.spyOn(FlowEditorHelper, 'loadfiles').mockImplementation((callback: any) => {
    setTimeout(callback, 0);
    return {} as any;
  });

  const errorData = {
    flowGet: {
      flow: null,
      errors: [
        {
          key: 'error',
          message: 'The flow is being edited by NGO Main Account',
        },
      ],
    },
  };

  let getFreeFlowCalled = false;
  const realUseLazyQuery = Apollo.useLazyQuery;

  const useLazyQuerySpy = vi.spyOn(Apollo, 'useLazyQuery').mockImplementation((query: any, options?: any) => {
    if (query === GET_FREE_FLOW) {
      const mockGetFreeFlow = vi.fn((variables?: any) => {
        if (!getFreeFlowCalled) {
          getFreeFlowCalled = true;
          if (options?.onCompleted) {
            setTimeout(() => options.onCompleted(errorData), 0);
          }
        }
        return Promise.resolve({ data: errorData });
      });

      return [
        mockGetFreeFlow,
        {
          called: false,
          loading: false,
          data: null,
        },
      ] as any;
    }

    return (realUseLazyQuery as any)(query, options);
  });

  try {
    const { container, debug } = render(wrapperFunction(activeFlowMocks));

    await screen.findByTestId('flowName');

    await waitFor(
      () => {
        const readOnlyBanner = container.querySelector('[class*="ReadOnlyBanner"]');
        expect(readOnlyBanner).toBeInTheDocument();
      },
      { timeout: 5000, interval: 200 }
    );

    const banner = container.querySelector('[class*="ReadOnlyBanner"]');
    expect(banner).toHaveTextContent('View Only Mode');
    expect(banner).toHaveTextContent('The flow is being edited by NGO Main Account');

    expect(screen.getByTestId('button')).toBeDisabled();
    expect(screen.getByTestId('translateButton')).toBeDisabled();
  } finally {
    useLazyQuerySpy.mockRestore();
  }
}, 5000);

test('should not display read-only banner when flow is available for editing', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  const { container } = render(defaultWrapper);

  await waitFor(() => {
    expect(container.querySelector('#flow')).toBeInTheDocument();
  });

  const banner = container.querySelector('[class*="ReadOnlyBanner"]');
  expect(banner).not.toBeInTheDocument();

  const publishButton = screen.getByTestId('button');
  const translateButton = screen.getByTestId('translateButton');
  expect(publishButton).not.toBeDisabled();
  expect(translateButton).not.toBeDisabled();
});
