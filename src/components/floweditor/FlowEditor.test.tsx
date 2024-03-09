import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { FlowEditor } from './FlowEditor';
import {
  getActiveFlow,
  getInactiveFlow,
  getFlowWithoutKeyword,
  getOrganizationServicesQuery,
  publishFlow,
  getFreeFlow,
  resetFlowCount,
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
import axios from 'axios';

window.location = { assign: vi.fn() } as any;

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676' }),
  };
});

vi.mock('axios');
const mockedAxios = axios as any;

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
];

const activeFlowMocks = [...mocks, getActiveFlow];
const inActiveFlowMocks = [...mocks, getInactiveFlow];
const noKeywordMocks = [...mocks, getFlowWithoutKeyword, resetFlowCount];

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
    expect(screen.findByTestId('beneficiaryName'));
  });

  // need some assertion
});

test('if the flow the inactive', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(wrapperFunction(inActiveFlowMocks));

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });
  fireEvent.click(screen.getByTestId('previewButton'));
  await waitFor(() => {
    expect(screen.findByTestId('beneficiaryName'));
  });

  // need some assertion
});

test('flow with no keywords', async () => {
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  render(wrapperFunction(noKeywordMocks));

  await waitFor(() => {
    expect(screen.findByText('help workflow'));
  });
  fireEvent.click(screen.getByTestId('previewButton'));
  await waitFor(() => {
    expect(screen.findByTestId('beneficiaryName'));
  });

  // need some assertion
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
    // need to have an assertion after the query ran
  });
});
