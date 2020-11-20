import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SpeedSendPage } from './SpeedSendPage';
import { MockedProvider } from '@apollo/client/testing';
import { getTemplateCountQuery } from '../../../../mocks/Template';

const mocks = [getTemplateCountQuery];

describe('<SpeedSendPage />', () => {
  it('should display the Speed Send Page', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <SpeedSendPage />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByTestId('listHeader')).toBeInTheDocument();
    });
  });
});
