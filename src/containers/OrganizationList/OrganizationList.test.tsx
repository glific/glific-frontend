import { render, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import OrganizationList from './OrganizationList';
import { getAllOrganizations } from '../../mocks/Organization';
import { BrowserRouter as Router } from 'react-router-dom';
import { setUserSession } from '../../services/AuthService';

afterEach(cleanup);
const mocks = getAllOrganizations;
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <OrganizationList />
    </Router>
  </MockedProvider>
);

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

test('Organization list renders correctly', async () => {
  const { getByText, findByText } = render(list);

  expect(getByText('Loading...')).toBeInTheDocument();

  await new Promise((resolve) => setTimeout(resolve, 0));

  const label = await findByText('Organizations');
  const nameLabel = await findByText('NAME');
  const isActiveLabel = await findByText('IS ACTIVE');
  const actionLabel = await findByText('ACTIONS');

  expect(label).toBeInTheDocument();
  expect(nameLabel).toBeInTheDocument();
  expect(isActiveLabel).toBeInTheDocument();
  expect(actionLabel).toBeInTheDocument();
});
