import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import { OnboardSuccess } from './OnboardSuccess';

const wrapper = (
  <MockedProvider addTypename={false}>
    <MemoryRouter>
      <OnboardSuccess />
    </MemoryRouter>
  </MockedProvider>
);

test('it should load the page correctly', async () => {
  const { findByTestId } = render(wrapper);

  const onboard = await findByTestId('setupInitiation');
  expect(onboard).toHaveTextContent('Thank you! Your setup has been initiated.');
});
