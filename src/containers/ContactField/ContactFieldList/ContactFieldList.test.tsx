import 'mocks/matchMediaMock';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import { contactFieldMocks, contactFieldErrorMock } from 'mocks/ContactFields';
import ContactFieldList from './ContactFieldList';

afterEach(() => {
  cleanup();
});

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useParams: () => ({ id: '1' }),
}));

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={contactFieldMocks} addTypename={false}>
    <Router>
      <ContactFieldList />
    </Router>
  </MockedProvider>
);

test('it renders list successfully', async () => {
  render(list);
  expect(screen.getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    const variableNameLabel = screen.getByText('Variable name');
    const inputNameLabel = screen.getByText('Input name');
    const shortcodeLabel = screen.getByText('Shortcode');
    const actionLabel = screen.getByText('Actions');

    expect(variableNameLabel).toBeInTheDocument();
    expect(inputNameLabel).toBeInTheDocument();
    expect(shortcodeLabel).toBeInTheDocument();
    expect(actionLabel).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('age_group')).toBeInTheDocument();
    expect(screen.getAllByTestId('edit-icon')).toBeDefined();
  });

  const editButtons = screen.getAllByTestId('edit-icon');

  fireEvent.click(editButtons[0]);

  await waitFor(() => {
    expect(screen.getByTestId('inline-input')).toBeInTheDocument();
  });

  const inputFields = screen.getByTestId('inline-input') as HTMLElement;

  await userEvent.click(inputFields);
  await userEvent.type(inputFields.querySelector('input') as HTMLElement, ' Name');

  const saveButton = screen.getByTestId('save-button');
  fireEvent.click(saveButton);
  await waitFor(() => {
    expect(screen.getByText('Age Group Name')).toBeInTheDocument();
  });
});

const errorMock: any = [contactFieldErrorMock, ...contactFieldMocks, ...contactFieldMocks];

const listError = (
  <MockedProvider mocks={errorMock}>
    <Router>
      <ContactFieldList />
    </Router>
  </MockedProvider>
);

test('it renders component, edits field, saves and error occurs', async () => {
  render(listError);
  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    const editButtons = screen.getAllByTestId('edit-icon');
    expect(editButtons[3]).toBeInTheDocument();
    fireEvent.click(editButtons[3]);

    // Edit, clears value and click save
    const inputFields = screen.getAllByRole('textbox');
    userEvent.type(inputFields[1], '{selectall}{backspace}age_group');
  });

  const saveButton = screen.getByTestId('save-button');
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(screen.getByTestId('inlineInputError')).toBeInTheDocument();
  });
});

test('it opens contact field dialog box', async () => {
  const { getByTestId } = render(list);
  expect(screen.getByTestId('loading')).toBeInTheDocument();

  fireEvent.click(getByTestId('newItemButton'));
  const dialogTitle = await screen.findByText('Add a new Contact field');

  await waitFor(() => {
    expect(dialogTitle).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cancelActionButton'));
});
