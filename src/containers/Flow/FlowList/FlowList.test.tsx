import React from 'react';
import { render } from '@testing-library/react';
import { AutomationList } from './FlowList';
import { MockedProvider } from '@apollo/client/testing';
import { getAutomationCountQuery } from '../../../mocks/Automation';

const mocks = [getAutomationCountQuery];

const automationList = (
  <MockedProvider mocks={mocks}>
    <AutomationList />
  </MockedProvider>
);

describe('<Automation />', () => {
  it('should render Automation', () => {
    const { getByText } = render(automationList);
    expect(getByText('Loading...')).toBeInTheDocument();
  });
});
