import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import Configure from './Configure';

import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
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

const wrapper = (extraMocks: any[] = []) => {
  const mocks = [...WHATSAPP_FORM_MOCKS];

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={['/whatsapp-forms/1/configure']}>
        <Routes>
          <Route path="/whatsapp-forms/:id/configure" element={<Configure />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('<Configure />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads latest form revision and renders form name', async () => {
    render(wrapper());

    expect(await screen.findByText('This is form name')).toBeInTheDocument();
  });
  test('opens publish confirmation dialog', async () => {
    render(wrapper());

    const publishButton = await screen.findByText('Publish');
    fireEvent.click(publishButton);

    expect(await screen.findByText('Publish Form')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to publish this form?')).toBeInTheDocument();
  });

  test('toggles between Preview, Variables and Versions view', async () => {
    render(wrapper());

    expect(await screen.findByText('Preview')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Variables'));
    expect(await screen.findByText('Variables')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Versions'));
    expect(await screen.findByText('Versions')).toBeInTheDocument();
  });

  test('opens JSON viewer when View JSON is clicked', async () => {
    render(wrapper());

    fireEvent.click(await screen.findByText('View JSON'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });
  });
});
