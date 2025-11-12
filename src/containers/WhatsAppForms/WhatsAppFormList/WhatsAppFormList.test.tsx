import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import { publishWhatsappForm, publishWhatsappFormError, WHATSAPP_FORM_MOCKS } from 'mocks/WhatsApp';
import { MockedProvider } from '@apollo/client/testing';
import WhatsAppForms from '../WhatsAppForms';
import * as Notification from 'common/notification';
import { WhatsAppFormList } from './WhatsAppFormList';

export { publishWhatsappForm, publishWhatsappFormError } from 'mocks/WhatsApp';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
    setErrorMessage: vi.fn(),
  };
});

const wrapper = (extraMocks: any[] = [], initialEntry: string = '/whatsapp-forms') => {
  const allMocks = [...WHATSAPP_FORM_MOCKS, ...extraMocks];
  return (
    <MockedProvider mocks={allMocks}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/whatsapp-forms/add" element={<WhatsAppForms />} />
          <Route path="/whatsapp-forms/:id/edit" element={<WhatsAppForms />} />
          <Route path="/whatsapp-forms" element={<WhatsAppFormList />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('<WhatsAppFormList />', () => {
  test('updates filter value correctly when different options are selected', async () => {
    const { getByText, getAllByRole, findByText } = render(wrapper());
    const select = getAllByRole('combobox')[0];
    fireEvent.click(getByText('All'));

    expect(select).toHaveTextContent('All');
    fireEvent.mouseDown(select);

    const publishedOption = await findByText('Published');
    fireEvent.click(publishedOption);
    expect(select).toHaveTextContent('Published');

    fireEvent.mouseDown(select);

    const inactiveOption = getByText('Inactive');
    fireEvent.click(inactiveOption);
    expect(select).toHaveTextContent('Inactive');

    fireEvent.mouseDown(select);

    const draftOption = getByText('Draft');
    fireEvent.click(draftOption);
    expect(select).toHaveTextContent('Draft');
  });

  test('navigates to add form page when "Create New Form" button clicked', () => {
    const { getByTestId } = render(wrapper());

    const button = getByTestId('newItemButton');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/whatsapp-forms/add');
  });

  test('render search bar correctly', () => {
    const { getByTestId } = render(wrapper());
    const search = getByTestId('searchForm');
    expect(search).toBeInTheDocument();
  });

  test('publishes a form successfully when publish button clicked', async () => {
    const { getByText, getAllByRole, getByTestId } = render(wrapper([publishWhatsappForm]));
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    const select = getAllByRole('combobox')[0];
    fireEvent.click(getByText('All'));

    expect(select).toHaveTextContent('All');
    fireEvent.mouseDown(select);
    const draftOption = getByText('Draft');
    fireEvent.click(draftOption);
    expect(select).toHaveTextContent('Draft');

    const publishIcon = await waitFor(() => getByTestId('publish-icon'));
    fireEvent.click(publishIcon);

    await waitFor(() => {
      expect(getByTestId('dialogTitle')).toBeInTheDocument();
    });

    expect(getByTestId('dialogTitle')).toHaveTextContent('Do you want to publish this form');

    const ConfirmButton = await waitFor(() => getByTestId('ok-button'));
    fireEvent.click(ConfirmButton);
    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('shows error message when publish API fails', async () => {
    const { getByText, getAllByRole, findByTestId } = render(wrapper([publishWhatsappFormError]));
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage');

    const select = getAllByRole('combobox')[0];
    fireEvent.mouseDown(select);
    fireEvent.click(getByText('Draft'));

    const publishButton = await findByTestId('additionalButton');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
