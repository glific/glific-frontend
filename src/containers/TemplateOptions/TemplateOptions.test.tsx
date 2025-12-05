import { render, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';
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
  const hsmTitle = await findByText('Create a new HSM Template');
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
  const hsmTitle = await findByText('Create a new HSM Template');
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

test('it disables CTA addition after 1 phone number and 2 URLs are added on call to action', async () => {
  const { findByText, getAllByRole, getByText, findByLabelText, queryByText } = render(wrapper());

  fireEvent.click(await findByText('Add buttons'));

  const selectButtonType = await findByLabelText('Select Button Type');
  fireEvent.mouseDown(selectButtonType);
  fireEvent.click(await findByText('Call to Action'));

  const radioButtons = getAllByRole('radio');
  fireEvent.click(radioButtons[0]);

  let [value1, title1] = getAllByRole('textbox');

  fireEvent.change(title1, { target: { value: 'Contact Us' } });
  fireEvent.change(value1, { target: { value: '+919090909090' } });

  fireEvent.click(getByText('Add Call to action'));
  await waitFor(() => {});

  let [value2, title2] = getAllByRole('textbox');

  fireEvent.change(title2, { target: { value: 'Visit Website' } });
  fireEvent.change(value2, { target: { value: 'https://example.com' } });

  fireEvent.click(getByText('Add Call to action'));
  await waitFor(() => {});

  let [value3, title3] = getAllByRole('textbox');

  fireEvent.change(title3, { target: { value: 'More Info' } });
  fireEvent.change(value3, { target: { value: 'https://info.com' } });

  expect(queryByText('Add Call to action')).not.toBeInTheDocument();
});

test('it renders quick reply button template successfully', async () => {
  const { findByText, findByLabelText, getByText, getByTestId } = render(wrapper());
  const hsmTitle = await findByText('Create a new HSM Template');
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
