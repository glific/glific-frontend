import { render, wait, within, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { SpeedSend } from './SpeedSend';
import { Switch, Route } from 'react-router-dom';
import { SpeedSendList } from '../../List/SpeedSendList/SpeedSendList';
import { TEMPLATE_MOCKS } from '../../Template.test.helper';
import { setUserSession } from '../../../../services/AuthService';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;
setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('SpeedSend', () => {
  test('cancel button should redirect to SpeedSendlist page', async () => {
    const { container, getByText, unmount } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Switch>
            <Route path="/speed-send" exact component={SpeedSendList} />
          </Switch>
          <SpeedSend match={{ params: { id: 1 } }} />
        </Router>
      </MockedProvider>
    );
    await waitFor(() => {
      const { queryByText } = within(container.querySelector('form'));
      const button = queryByText('Cancel');
      fireEvent.click(button);
    });

    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
    expect(getByText('Speed sends')).toBeInTheDocument();
    unmount();
  });

  test('save button should add a new template', async () => {
    const { container, getAllByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <SpeedSend match={{ params: { id: null } }} />
          <Switch>
            <Route path="/speed-send" exact component={SpeedSendList} />
          </Switch>
        </Router>
      </MockedProvider>
    );

    await wait();
    fireEvent.change(container.querySelector('input[name="label"]'), {
      target: { value: 'new Template' },
    });

    const { queryByText } = within(container.querySelector('form'));
    const button = queryByText('Save');
    fireEvent.click(button);
    await wait();
    await wait();

    expect(queryByText('Message is required.')).toBeInTheDocument();

    // const { getByText } = within(container.querySelector('tbody'));
    // expect(getByText('Good message')).toBeInTheDocument();
  });
});
