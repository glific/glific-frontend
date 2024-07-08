import { fireEvent, render, waitFor, cleanup, screen, within } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import {
  getConsultingHour,
  getOrganizationList,
  createConsultingHour,
  updateConsultingHour,
} from 'mocks/Consulting';
import { setUserSession } from 'services/AuthService';
import { Consulting } from './Consulting';
import userEvent from '@testing-library/user-event';
import { getOrganizationLanguagesWithoutOrder } from 'mocks/Organization';

afterEach(cleanup);
const setOpenDialogMock = vi.fn();
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const mocks = [
  getOrganizationList,
  getConsultingHour,
  createConsultingHour,
  updateConsultingHour,
  getOrganizationLanguagesWithoutOrder,
];
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Consulting organizationId="" setOpenDialog={setOpenDialogMock} />}
        />
        <Route path="consulting-hours" element={<div />} />
      </Routes>
    </Router>
  </MockedProvider>
);

test('Render component correctly with empty form', async () => {
  const user = userEvent.setup();
  render(wrapper);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Add consulting record')).toBeInTheDocument();
  });

  // Get all input elements
  const inputElements = screen.getAllByRole('textbox');
  // Get all radio buttons
  const radioButtons = screen.getAllByRole('radio');

  // For selecting organization from dropdown
  const autoComplete = screen.getByTestId('autocomplete-element');
  const input = within(autoComplete).getByRole('combobox');
  autoComplete.focus();
  fireEvent.change(input, { target: { value: 'G' } });

  await waitFor(() => {
    const selectedOption = screen.getByText('Glific');

    fireEvent.click(selectedOption);
  });

  await waitFor(() => {
    fireEvent.change(inputElements[0], { target: { value: 'Glific' } });
    fireEvent.change(inputElements[1], { target: { value: 'John Doe' } });
    fireEvent.change(inputElements[3], { target: { value: 15 } });
    fireEvent.change(inputElements[4], { target: { value: 'Glific Tean' } });
    fireEvent.click(radioButtons[0]);
  });

  await waitFor(() => {
    const submitButton = screen.getByText('Save');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);
  });
});

const consultingEditForm = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Consulting organizationId="1" setOpenDialog={setOpenDialogMock} />}
        />
        <Route path="consulting-hours" element={<div />} />
      </Routes>
    </Router>
  </MockedProvider>
);

test('it renders consulting hours in edit mode', async () => {
  const { getByText, getByTestId } = render(consultingEditForm);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByTestId('AutocompleteInput').querySelector('input')?.value).toBe('Glific');
  });
});

test('it renders consulting hours in edit mode', async () => {
  const { getByText, getByTestId } = render(consultingEditForm);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByTestId('AutocompleteInput').querySelector('input')?.value).toBe('Glific');
  });
});

test('Click in cancel button', async () => {
  const { getByText } = render(consultingEditForm);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Cancel')).toBeInTheDocument();
  });
  fireEvent.click(getByText('Cancel'));
  await waitFor(() => {
    expect(setOpenDialogMock).toHaveBeenCalledWith(false);
  });
});
