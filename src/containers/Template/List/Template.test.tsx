import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { TEMPLATE_MOCKS, HSM_LIST } from 'containers/Template/Template.test.helper';
import { Template } from './Template';

afterEach(cleanup);
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const speedSendProps: any = {
  title: 'Speed sends',
  listItem: 'sessionTemplates',
  listItemName: 'speed send',
  pageLink: 'speed-send',
  listIcon: <div></div>,
  filters: { isHsm: false },
  buttonLabel: 'Create Speed Send',
};

test('it renders speed-send list component', async () => {
  render(
    <Router>
      <MockedProvider mocks={TEMPLATE_MOCKS} addTypename={false}>
        <Template {...speedSendProps} />
      </MockedProvider>
    </Router>
  );

  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  await waitFor(() => {
    const showTranslationButton = screen.getByText('DownArrow.svg');
    expect(showTranslationButton).toBeInTheDocument();

    fireEvent.click(showTranslationButton);

    // toggling
    fireEvent.click(showTranslationButton);
  });
});

const hsmProps: any = {
  title: 'Templates',
  listItem: 'sessionTemplates',
  listItemName: 'HSM Template',
  pageLink: 'template',
  listIcon: <div></div>,
  filters: { isHsm: true },
  isHSM: true,
  buttonLabel: 'CREATE HSM TEMPLATE',
};

test('it renders hsm list component', async () => {
  render(
    <Router>
      <MockedProvider mocks={HSM_LIST} addTypename={false}>
        <Template {...hsmProps} />
      </MockedProvider>
    </Router>
  );

  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));
});
