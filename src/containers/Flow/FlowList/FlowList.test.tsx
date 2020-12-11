import React from 'react';
import { render } from '@testing-library/react';
import { FlowList } from './FlowList';
import { MockedProvider } from '@apollo/client/testing';
import { getFlowCountQuery } from '../../../mocks/Flow';

const mocks = [getFlowCountQuery];

const flowList = (
  <MockedProvider mocks={mocks}>
    <FlowList />
  </MockedProvider>
);

describe('<Flow />', () => {
  it('should render Flow', () => {
    const { getByText } = render(flowList);
    expect(getByText('Loading...')).toBeInTheDocument();
  });
});
