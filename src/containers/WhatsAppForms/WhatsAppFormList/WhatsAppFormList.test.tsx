import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import {
  publishWhatsappForm,
  publishWhatsappFormError,
  WHATSAPP_FORM_MOCKS,
  deactivateWhatsappForm,
  deactivateWhatsappFormError,
  syncWhatsappFormQueryWithErrors,
  syncWhatsappForm,
} from 'mocks/WhatsAppForm';
import { MockedProvider } from '@apollo/client/testing';
import WhatsAppForms from '../WhatsAppForms';
import * as Notification from 'common/notification';
import { WhatsAppFormList } from './WhatsAppFormList';
import Configure from 'containers/WhatsAppForms/Configure/Configure';
export { publishWhatsappForm, publishWhatsappFormError } from 'mocks/WhatsAppForm';

const mockNavigate = vi.fn();
window.open = vi.fn();
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
          <Route path="/whatsapp-forms/:id/configure" element={<Configure />} />
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
    const { getByText, getAllByRole, getByTestId } = render(wrapper([publishWhatsappForm('3')]));
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
    const { getByTestId } = render(wrapper([publishWhatsappFormError]));
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage');

    const publishIcon = await waitFor(() => getByTestId('publish-icon'));

    fireEvent.click(publishIcon);

    await waitFor(() => {
      expect(getByTestId('dialogTitle')).toHaveTextContent('Do you want to publish this form');
    });
    fireEvent.click(getByTestId('ok-button'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  test('deactivate a form successfully when inactive button is clicked', async () => {
    const { getByTestId, getAllByTestId } = render(wrapper([deactivateWhatsappForm]));
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    const deactivateIcon = await waitFor(() => getAllByTestId('deactivate-icon')[0]);
    fireEvent.click(deactivateIcon);

    await waitFor(() => {
      expect(getByTestId('dialogTitle')).toBeInTheDocument();
    });

    expect(getByTestId('dialogTitle')).toHaveTextContent('Do you want to deactivate this form?');

    const ConfirmButton = await waitFor(() => getByTestId('ok-button'));
    fireEvent.click(ConfirmButton);
    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('shows error message when deactivate API fails', async () => {
    const { getByText, getAllByRole, getByTestId, getAllByTestId } = render(wrapper([deactivateWhatsappFormError]));
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage');

    const select = getAllByRole('combobox')[0];
    fireEvent.click(getByText('All'));

    expect(select).toHaveTextContent('All');

    expect(getByTestId('loading')).toBeInTheDocument();

    const deactivateIcon = await waitFor(() => getAllByTestId('deactivate-icon')[0]);
    fireEvent.click(deactivateIcon);

    await waitFor(() => {
      expect(getByTestId('dialogTitle')).toBeInTheDocument();
    });

    expect(getByTestId('dialogTitle')).toHaveTextContent('Do you want to deactivate this form?');

    const ConfirmButton = await waitFor(() => getByTestId('ok-button'));
    fireEvent.click(ConfirmButton);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  test('should navigate to edit template page', async () => {
    const { getByText } = render(wrapper());

    await waitFor(() => {
      expect(getByText('WhatsApp Forms')).toBeInTheDocument();
    });

    await screen.findByText('WhatsApp Forms');

    const viewIcons = await screen.findAllByTestId('view-form');
    fireEvent.click(viewIcons[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/whatsapp-forms/2/edit');
    });
  });

  test('should open the link  clicking the link icon', async () => {
    const { getByText, getAllByRole, getByTestId, getAllByTestId } = render(wrapper());

    const select = getAllByRole('combobox')[0];
    fireEvent.click(getByText('All'));

    expect(select).toHaveTextContent('All');

    expect(getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('WhatsApp Forms')).toBeInTheDocument();
    });
    const linkIcon = await waitFor(() => getAllByTestId('link-icon')[0]);
    fireEvent.click(linkIcon);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });
  });

  test('clicking on sync button should sync whatsapp forms', async () => {
    const { getByTestId } = render(wrapper([syncWhatsappForm]));
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    const syncButton = await waitFor(() => getByTestId('syncWhatsappForm'));
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });

    expect(notificationSpy).toHaveBeenCalledWith(
      'Syncing of the WhatsApp forms has started in the background. Please check the Notifications page for updates.',
      'success'
    );
  });

  test('sync whatsapp forms shows error notification on failure', async () => {
    const { getByTestId } = render(wrapper([syncWhatsappFormQueryWithErrors]));
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    const syncButton = await waitFor(() => getByTestId('syncWhatsappForm'));
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });

    expect(notificationSpy).toHaveBeenCalledWith('Sorry, failed to sync whatsapp forms updates.', 'warning');
  });

  test('navigates to configure page when configure icon is clicked', async () => {
    const { getByText, getAllByTestId } = render(wrapper());

    await waitFor(() => {
      expect(getByText('Draft')).toBeInTheDocument();
    });

    const configureIcon = await waitFor(() => getAllByTestId('edit-icon')[2]);
    fireEvent.click(configureIcon);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/whatsapp-forms/3/configure');
    });
  });
});
