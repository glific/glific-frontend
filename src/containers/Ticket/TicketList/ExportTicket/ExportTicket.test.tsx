import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import { setUserSession } from 'services/AuthService';
import { ExportTicket } from './ExportTicket';
import { getAllOrganizations } from 'mocks/Organization';
import * as utils from 'common/utils';
import { exportTicketsMock } from 'mocks/Ticket';

afterEach(() => {
  (window as any).matchMedia = null;
});

const mocks = [...getAllOrganizations, exportTicketsMock];
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const setShowExportDialogMock = vi.fn();
const exportConsulting = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ExportTicket setShowExportDialog={setShowExportDialogMock} />
    </Router>
  </MockedProvider>
);

it('Renders Export ticket component successfully and closes on clicking cancel', async () => {
  const { getAllByText, getByTestId } = render(exportConsulting);

  await waitFor(() => {
    expect(getAllByText('Date from')[0]).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('cancel-button'));

  await waitFor(() => {
    expect(setShowExportDialogMock).toHaveBeenCalled();
  });
});

it('Renders Export ticket component successfully', async () => {
  const downloadFileMock = vi.spyOn(utils, 'downloadFile');
  const container = render(exportConsulting);

  const { getAllByText, getByTestId } = container;

  await waitFor(() => {
    expect(getAllByText('Date from')[0]).toBeInTheDocument();
  });

  const dateFrom = container.queryByTestId('Date from');
  const dateTo = container.queryByTestId('Date to');
  if (dateFrom && dateTo) {
    fireEvent.change(dateFrom, { target: { value: '01/15/2024' } });
    fireEvent.change(dateTo, { target: { value: '04/15/2024' } });
  }

  fireEvent.click(getByTestId('ok-button'));

  await waitFor(() => {
    expect(downloadFileMock).toHaveBeenCalled();
  });
});

it('it should validate the start and end dates', async () => {
  const container = render(exportConsulting);
  const { getAllByText, getByTestId, getByText } = container;

  await waitFor(() => {
    expect(getAllByText('Date from')[0]).toBeInTheDocument();
  });

  const dateFrom = container.queryByTestId('Date from');
  const dateTo = container.queryByTestId('Date to');
  if (dateFrom && dateTo) {
    fireEvent.change(dateFrom, { target: { value: '08/15/2024' } });
    fireEvent.change(dateTo, { target: { value: '04/15/2024' } });
  }

  fireEvent.click(getByTestId('ok-button'));

  await waitFor(() => {
    expect(getByText('End date should be greater than the start date')).toBeInTheDocument();
  });
});
