import { MockedProvider } from '@apollo/client/testing';
import {
  CERTIFICATE_LIST_MOCKS,
  CERTIFICATE_MOCKS,
  createCertificate,
  createCertificateWithError,
} from 'mocks/Certificate';
import { MemoryRouter, Route, Routes } from 'react-router';
import CertificateList from './CertificatesList/CertificateList';
import Certificate from './Certificate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: () => {},
    },
  });
  vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());
});

const wrapper = (mocks?: any) => {
  return (
    <MockedProvider
      mocks={
        mocks
          ? [...CERTIFICATE_LIST_MOCKS, ...CERTIFICATE_MOCKS, ...mocks]
          : [...CERTIFICATE_LIST_MOCKS, ...CERTIFICATE_MOCKS]
      }
    >
      <MemoryRouter initialEntries={['/certificates']}>
        <Routes>
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/certificate/add" element={<Certificate />} />
          <Route path="/certificate/:id/edit" element={<Certificate />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

const notificationSpy = vi.spyOn(Notification, 'setNotification');
window.open = vi.fn();

describe('Certificate', () => {
  test('should render Certificate list', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });
  });

  test('should click on additional actions', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('link-icon')[0]);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });

    fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Copied to clipboard');
    });
  });

  test('should edit a certificate', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('EditIcon')[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Certificate')).toBeInTheDocument();
    });

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'new label' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(notificationSpy).toBeCalledWith('Certificate edited successfully!');
    });
  });

  test('should create a certificate', async () => {
    render(wrapper([createCertificate]));

    await waitFor(() => {
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Create a new Certificate')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'label' } });
    fireEvent.change(inputs[1], { target: { value: 'description' } });

    // testing url validation
    fireEvent.change(inputs[2], { target: { value: 'url' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.getByText('Invalid URL, Please add a Google Slides link.')).toBeInTheDocument();
    });
    fireEvent.change(inputs[2], {
      target: {
        value: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.g',
      },
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(notificationSpy).toBeCalledWith('Certificate created successfully!');
    });
  });

  test('should show error if the certificate has insufficient permissions', async () => {
    render(wrapper([createCertificateWithError, createCertificateWithError]));

    await waitFor(() => {
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Create a new Certificate')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'label' } });
    fireEvent.change(inputs[1], { target: { value: 'description' } });

    fireEvent.change(inputs[2], {
      target: {
        value: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.g',
      },
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Permission Issues!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('CloseIcon'));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Permission Issues!')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
    });
  });
});
