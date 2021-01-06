import React from 'react';
import { render } from '@testing-library/react';
import { FlowList } from './FlowList';
import { MockedProvider } from '@apollo/client/testing';
import { getFlowCountQuery } from '../../../mocks/Flow';
import { MemoryRouter } from 'react-router';

const mocks = [getFlowCountQuery];

const flowList = (
  <MockedProvider mocks={mocks}>
    <MemoryRouter>
      <FlowList />
    </MemoryRouter>
  </MockedProvider>
);

describe('<Flow />', () => {
  it('should render Flow', () => {
    const { getByText } = render(flowList);
    expect(getByText('Loading...')).toBeInTheDocument();
  });
});
