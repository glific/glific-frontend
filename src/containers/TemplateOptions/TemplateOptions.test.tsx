import { render, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsApp';
import { MemoryRouter, Route, Routes } from 'react-router';
import HSM from 'containers/HSM/HSM';

const wrapper = (initialEntry: string = '/template/add') => (
  <MockedProvider mocks={WHATSAPP_FORM_MOCKS}>
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="template/add" element={<HSM />} />
        <Route path="template/:id/edit" element={<HSM />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

test('it renders component and selects call to action type', async () => {
  const { findByText, getByText, findByLabelText } = render(wrapper());
  const hsmTitle = await findByText('Add a new HSM Template');
  expect(hsmTitle).toBeInTheDocument();
  const addButtonsCheckbox = getByText('Add buttons');
  fireEvent.click(addButtonsCheckbox);
  await waitFor(() => {});
  const input = await findByLabelText('Select Button Type');
  fireEvent.mouseDown(input);
  const option = await findByText('Call to Action');
  fireEvent.click(option);
  await waitFor(() => {});
});

test('it renders call to action button template successfully', async () => {
  const { findByText, getAllByRole, getByText, findByLabelText } = render(wrapper());
  const hsmTitle = await findByText('Add a new HSM Template');
  expect(hsmTitle).toBeInTheDocument();
  const addButtonsCheckbox = getByText('Add buttons');
  fireEvent.click(addButtonsCheckbox);
  await waitFor(() => {});
  const input = await findByLabelText('Select Button Type');
  fireEvent.mouseDown(input);
  const option = await findByText('Call to Action');
  fireEvent.click(option);

  const callToActionButton = getAllByRole('radio');
  fireEvent.click(callToActionButton[1]);
  await waitFor(() => {});

  const [value, title] = getAllByRole('textbox');

  fireEvent.change(title, { target: { value: 'Contact Us' } });
  fireEvent.blur(title);
  await waitFor(() => {});

  fireEvent.change(value, { target: { value: '+919090909090' } });
  fireEvent.blur(value);
  await waitFor(() => {});
});

test('it renders quick reply button template successfully', async () => {
  const { findByText, findByLabelText, getByText, getByTestId } = render(wrapper());
  const hsmTitle = await findByText('Add a new HSM Template');
  expect(hsmTitle).toBeInTheDocument();
  const addButtonsCheckbox = getByText('Add buttons');
  fireEvent.click(addButtonsCheckbox);
  await waitFor(() => {});
  const input = await findByLabelText('Select Button Type');
  fireEvent.mouseDown(input);
  const option = await findByText('Call to Action');
  fireEvent.click(option);
  await waitFor(() => {});
  const quickButton = getByTestId('addButton');
  expect(quickButton).toBeInTheDocument();
  const addButton = getByText('Add Call to action');
  expect(addButton).toBeInTheDocument();
  fireEvent.click(addButton);
  await waitFor(() => {});
});
