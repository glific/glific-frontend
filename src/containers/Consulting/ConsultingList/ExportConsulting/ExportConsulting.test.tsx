import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { ExportConsulting } from './ExportConsulting';
import { getAllOrganizations } from 'mocks/Organization';
import { getOrganizationList } from 'mocks/Consulting';

const mocks = [...getAllOrganizations, getOrganizationList];
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const setFiltersMock = vi.fn();

const exportConsulting = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ExportConsulting setFilters={setFiltersMock} />
    </Router>
  </MockedProvider>
);

it('Renders Export consulting component successfully', async () => {
  const { getAllByText } = render(exportConsulting);

  await waitFor(() => {
    expect(getAllByText('Date from')[0]).toBeInTheDocument();
  });
});

it('should give proper validation errors', async () => {
  const { getAllByText, getByText } = render(exportConsulting);

  await waitFor(() => {
    expect(getAllByText('Date from')[0]).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Filter'));

  await waitFor(() => {
    expect(getByText('Organization is required')).toBeInTheDocument();
  });
});
