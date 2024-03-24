import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { BulkAction } from './BulkAction';
import { getAllOrganizations } from 'mocks/Organization';
import { getAllFlowLabelsQuery } from 'mocks/Flow';

const mocks = [...getAllOrganizations, getAllFlowLabelsQuery];
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const bulkUpdate = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <BulkAction setShowBulkClose={() => vi.fn()} />
    </Router>
  </MockedProvider>
);

it('Renders Export ticket component successfully', async () => {
  const { getByText } = render(bulkUpdate);

  await waitFor(() => {
    expect(getByText('All tickets will be closed for this topic')).toBeInTheDocument();
  });
});
