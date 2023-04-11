import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { ORGANISATION_MOCKS } from '../SettingList.test.helper';
import { Organisation } from './Organisation';

const mocks = ORGANISATION_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Organisation />
    </Router>
  </MockedProvider>
);

test('it renders component properly', async () => {
  const { getByText } = render(wrapper);
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Back to settings')).toBeInTheDocument();
  });
});

test('it renders component and clicks cancel', async () => {
  const { getByText } = render(wrapper);
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const Button = screen.getByText('Cancel');
    expect(Button).toBeInTheDocument();
    // click on Cancel
    UserEvent.click(Button);
  });
});

test('it renders component in edit mode', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={[...ORGANISATION_MOCKS]} addTypename={false}>
      <Router>
        <Organisation />
      </Router>
    </MockedProvider>
  );
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    const phoneNumber = getByTestId('phoneNumber');
    fireEvent.click(phoneNumber);
    expect(phoneNumber).toBeInTheDocument();
  });

  await waitFor(() => {
    const submit = getByTestId('submitActionButton');
    fireEvent.click(submit);
  });
});
