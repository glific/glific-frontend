import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { ExportConsulting } from './ExportConsulting';
import { getAllOrganizations } from 'mocks/Organization';
import { getOrganizationList, exportConsulting as exportConsultingMock } from 'mocks/Consulting';
import * as utils from 'common/utils';

afterEach(() => {
  (window as any).matchMedia = null;
});

const mocks = [...getAllOrganizations, getOrganizationList, exportConsultingMock];
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

it('should export consulting', async () => {
  const { getAllByRole, getByTestId } = render(exportConsulting);

  const autocomplete = screen.getByTestId('autocomplete-element');

  await waitFor(() => {
    expect(autocomplete).toBeInTheDocument();
  });

  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autocomplete, { key: 'Enter' });

  const dateInputs = getAllByRole('textbox');
  fireEvent.change(dateInputs[0], { target: { value: '09/03/2020' } });
  fireEvent.change(dateInputs[1], { target: { value: '09/04/2020' } });

  fireEvent.click(getByTestId('export'));

  const spy = vi.spyOn(utils, 'downloadFile');

  await waitFor(() => {
    expect(spy).toHaveBeenCalled();
  });
});
