import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { ExportTicket } from './ExportTicket';
import { getAllOrganizations } from 'mocks/Organization';

const mocks = getAllOrganizations;
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const exportConsulting = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ExportTicket setShowExportDialog={() => vi.fn()} />
    </Router>
  </MockedProvider>
);

it('Renders Export ticket component successfully', async () => {
  const { getAllByText } = render(exportConsulting);

  await waitFor(() => {
    expect(getAllByText('Date from')[0]).toBeInTheDocument();
  });
});
