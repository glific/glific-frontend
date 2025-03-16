import { MockedProvider } from '@apollo/client/testing';
import { CERTIFICATE_LIST_MOCKS, CERTIFICATE_MOCKS } from 'mocks/Certificate';
import { MemoryRouter, Route, Routes } from 'react-router';
import CertificateList from './CertificatesList/CertificateList';
import Certificate from './Certificate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';

const wrapper = (
  <MockedProvider mocks={[...CERTIFICATE_LIST_MOCKS, ...CERTIFICATE_MOCKS]}>
    <MemoryRouter initialEntries={['/certificates']}>
      <Routes>
        <Route path="/certificates" element={<CertificateList />} />
        <Route path="/certificate/add" element={<Certificate />} />
        <Route path="/certificate/:id/edit" element={<Certificate />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const notificationSpy = vi.spyOn(Notification, 'setNotification');

describe('Certificate', () => {
  test('should render Certificate list', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });
  });

  test('should edit a certificate', async () => {
    render(wrapper);

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
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Add a new Certificate')).toBeInTheDocument();
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
        value: 'https://docs.google.com/presentation/d/1fBrDFDCD2iwnaKg8sxKd45lRbqLuBFvsZbSH1sjm7aI/edit#slide=id.p',
      },
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(notificationSpy).toBeCalledWith('Certificate created successfully!');
    });
  });
});
