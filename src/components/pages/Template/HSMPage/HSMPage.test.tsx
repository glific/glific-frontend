import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { HSMPage } from './HSMPage';
import { getHSMTemplateCountQuery } from '../../../../mocks/Template';

const mocks = [getHSMTemplateCountQuery];

describe('<HSMPage />', () => {
  it('should display the HSM Page', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <HSMPage />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('listHeader')).toBeInTheDocument();
    });
  });
});
