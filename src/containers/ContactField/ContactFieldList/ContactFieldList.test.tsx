import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ContactFieldList from './ContactFieldList';
import { setUserSession } from '../../../services/AuthService';
import { mocks } from '../../../mocks/ContactFields';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const props = {
  match: { params: {} },
  openDialog: false,
};

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ContactFieldList {...props} />
    </Router>
  </MockedProvider>
);

test('it renders list successfully', async () => {
  render(list);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  const variableNameLabel = screen.getByText('VARIABLE NAME');
  const inputNameLabel = screen.getByText('INPUT NAME');
  const shortcodeLabel = screen.getByText('SHORTCODE');
  const actionLabel = screen.getByText('ACTIONS');

  expect(variableNameLabel).toBeInTheDocument();
  expect(inputNameLabel).toBeInTheDocument();
  expect(shortcodeLabel).toBeInTheDocument();
  expect(actionLabel).toBeInTheDocument();

  const editButton = screen.getAllByRole('button', {
    name: 'GreenEdit.svg',
  })[0];
  expect(editButton).toBeInTheDocument();
  fireEvent.click(editButton);

  await waitFor(() => {});

  const inputFields = screen.getAllByRole('textbox');
  userEvent.type(inputFields[1], '{selectall}{backspace}Age Group Name');

  await waitFor(() => {});
  const saveButton = screen.getByTestId('save-button');
  fireEvent.click(saveButton);

  await waitFor(() => {});
});
