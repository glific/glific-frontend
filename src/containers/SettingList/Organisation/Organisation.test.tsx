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

test('it should render the placeholders correctly', async () => {
  const { getByTestId, getByText } = render(wrapper);

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('formLayout')).toHaveTextContent('Organisation name');
    expect(getByTestId('formLayout')).toHaveTextContent('Supported languages');
    expect(getByTestId('formLayout')).toHaveTextContent('Default language');
    expect(getByTestId('formLayout')).toHaveTextContent('Organisation phone number');
    expect(getByTestId('formLayout')).toHaveTextContent('Low balance threshold for warning emails');
    expect(getByTestId('formLayout')).toHaveTextContent(
      'Critical balance threshold for warning emails'
    );
    expect(getByTestId('formLayout')).toHaveTextContent('Recieve warning mails?');
  });
});

test('it renders component properly', async () => {
  const { getByText, getByTestId } = render(wrapper);
  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByTestId('add-container')).toHaveTextContent('Organisation name');
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
  // loading is show initiallyiokk
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

test('it submits form correctly', async () => {
  const { getByText, getByTestId } = render(wrapper);

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    const inputElements = screen.getAllByRole('textbox');
    const numberInputElements = screen.getAllByRole('spinbutton');

    fireEvent.change(inputElements[0], { target: { value: 'Glificc' } });
    fireEvent.change(inputElements[1], { target: { value: 'Please change me, NOW!' } });
    fireEvent.change(numberInputElements[0], { target: { value: '10' } });
    fireEvent.change(numberInputElements[1], { target: { value: '5' } });
  });

  await waitFor(() => {
    const submitButton = screen.getByText('Save');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);
  });

  await waitFor(() => {
    expect(getByTestId('formLayout')).toHaveTextContent('Organisation name');
  });
});
