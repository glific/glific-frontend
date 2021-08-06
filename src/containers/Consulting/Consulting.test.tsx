import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import {
  getConsultingHour,
  getOrganizationList,
  createConsultingHour,
  updateConsultingHour,
} from 'mocks/Consulting';
import { setUserSession } from 'services/AuthService';
import { Consulting } from './Consulting';

afterEach(cleanup);
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
const mocks = [getOrganizationList, getConsultingHour, createConsultingHour, updateConsultingHour];
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Consulting match={{ params: {} }} />
  </MockedProvider>
);

test('Render component correctly with empty form', async () => {
  const { container } = render(wrapper);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(container).toBeInTheDocument();
  expect(screen.getByText('Add consulting record')).toBeInTheDocument();

  // Get all input elements
  const inputElements = screen.getAllByRole('textbox');
  // Get all radio buttons
  const radioButtons = screen.getAllByRole('radio');

  // For selecting organization from dropdown
  const autoComplete = screen.getByTestId('autocomplete-element');
  fireEvent.mouseDown(autoComplete);

  waitFor(() => {
    const selectedOption = screen.getByText('Glific');
    expect(selectedOption).toBeInTheDocument();

    fireEvent.click(selectedOption);
  });

  await waitFor(() => {
    fireEvent.change(inputElements[0], { target: { value: 'Glific' } });
    fireEvent.change(inputElements[1], { target: { value: 'John Doe' } });
    fireEvent.change(inputElements[3], { target: { value: 15 } });
    fireEvent.change(inputElements[4], { target: { value: 'Glific Tean' } });
    fireEvent.change(inputElements[5], { target: { value: 'Notes' } });
    fireEvent.click(radioButtons[0]);
  });

  await waitFor(() => {
    const submitButton = screen.getByText('Save');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);
  });
});

test('it renders consulting hours in edit mode', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Consulting match={{ params: { id: '1' } }} />
    </MockedProvider>
  );

  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 100)));
});
