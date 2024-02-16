import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { ORGANIZATION_MOCKS } from '../SettingList.test.helper';
import { OrganizationFlows } from './OrganizationFlows';

const mocks = ORGANIZATION_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <OrganizationFlows />
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
    <MockedProvider mocks={[...ORGANIZATION_MOCKS]} addTypename={false}>
      <Router>
        <OrganizationFlows />
      </Router>
    </MockedProvider>
  );
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    const autoCompleteInput = screen.getAllByTestId('autocomplete-element');

    fireEvent.mouseDown(autoCompleteInput[3]);

    waitFor(() => {
      const selectedOption = screen.getByText('Monday');
      expect(selectedOption).toBeInTheDocument();

      fireEvent.click(selectedOption);
    });
  });

  await waitFor(() => {
    const submit = getByTestId('submitActionButton');
    fireEvent.click(submit);
  });
});
