import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import { formJson, WHATSAPP_FORM_MOCKS } from 'mocks/WhatsApp';
import { MemoryRouter, Route, Routes } from 'react-router';
import WhatsAppFormList from './WhatsAppFormList/WhatsAppFormList';
import WhatsAppForms from './WhatsAppForms';

describe('<WhatsAppForms />', () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  const wrapper = (initialEntry: string = '/whatsapp-forms/add') => (
    <MockedProvider mocks={WHATSAPP_FORM_MOCKS}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/whatsapp-forms/add" element={<WhatsAppForms />} />
          <Route path="/whatsapp-forms/:id/edit" element={<WhatsAppForms />} />
          <Route path="/whatsapp-forms" element={<WhatsAppFormList />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  test('it should render the WhatsApp Form page initially', async () => {
    const { getByText } = render(wrapper());
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Create WhatsApp Form')).toBeInTheDocument();
    });
  });

  test('it should create WhatsApp Form page with form fields', async () => {
    const { getByTestId, getByText, getAllByRole } = render(wrapper());
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Create WhatsApp Form')).toBeInTheDocument();
    });

    const inputs = getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'Test Form' } });
    fireEvent.change(inputs[1], { target: { value: 'This is a test form' } });
    fireEvent.change(inputs[2], { target: { value: 'sign_up' } });

    fireEvent.click(getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(getByText('Must be valid JSON')).toBeInTheDocument();
    });

    const autocomplete = getByTestId('AutocompleteInput');

    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

    fireEvent.click(getByText('Other'), { key: 'Enter' });
    fireEvent.change(inputs[2], { target: { value: JSON.stringify(formJson) } });

    fireEvent.click(getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Whatsapp Form created successfully!');
    });
  });

  test('it should edit WhatsApp Form page with form fields', async () => {
    const { getByTestId, getByText, getAllByRole } = render(wrapper('/whatsapp-forms/1/edit'));
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Edit WhatsApp Form')).toBeInTheDocument();
    });

    const inputs = getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'Updated Form Name' } });
    fireEvent.change(inputs[1], { target: { value: 'This is an updated test form' } });

    fireEvent.click(getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});
