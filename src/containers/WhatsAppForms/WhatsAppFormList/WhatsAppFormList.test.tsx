import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import { WhatsAppFormList } from './WhatsAppFormList';
import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsApp';
import { MockedProvider } from '@apollo/client/testing';
import WhatsAppForms from '../WhatsAppForms';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const wrapper = (initialEntry: string = '/whatsapp-forms') => (
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

describe('<WhatsAppFormList />', () => {
  test('updates filter value when changed', () => {
    const { getByRole } = render(wrapper());

    const select = getByRole('combobox');
    fireEvent.change(select, { target: { value: 'DRAFT' } });
    expect(select).toHaveValue('DRAFT');
  });

  test('navigates to add form page when "Create New Form" button clicked', () => {
    const { getByTestId } = render(wrapper());

    const button = getByTestId('newItemButton');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/whatsapp-forms/add');
  });

  test('render search bar corretly ', () => {
    const { getByTestId } = render(wrapper());
    screen.debug();
    const search = getByTestId('searchForm');
    expect(search).toBeInTheDocument();
  });

  test('renders WhatsApp forms list data correctly', async () => {
    const { getByTestId, getByText } = render(wrapper());
    expect(getByTestId('tableBody')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('This is form name')).toBeInTheDocument();
    });
  });
});
