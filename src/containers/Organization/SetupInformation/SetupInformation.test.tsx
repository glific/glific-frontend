import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import { SetupInformation } from './SetupInformation';

const wrapper = (
  <MockedProvider addTypename={false}>
    <MemoryRouter>
      <SetupInformation />
    </MemoryRouter>
  </MockedProvider>
);

test('it should load the page correctly', async () => {
  const { findByTestId } = render(wrapper);

  const onboard = await findByTestId('setupInformation');
  expect(onboard).toHaveTextContent('Setup your NGO on Glific');
});
