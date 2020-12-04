import React from 'react';
import { FlowEditor } from './FlowEditor';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { wait, render, waitFor, fireEvent } from '@testing-library/react';
import { getAutomationDetailsQuery } from '../../mocks/Flow';
import { conversationQuery } from '../../mocks/Chat';

const mocks = [getAutomationDetailsQuery, conversationQuery];
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <FlowEditor match={{ params: { uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676' } }} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should display the flowEditor', () => {
  const { container } = render(wrapper);
  expect(container.querySelector('#flow')).toBeInTheDocument();
});

test('it should have a done button that redirects to automation page', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('button')).toBeInTheDocument();
});

test('it should display name of the automation', async () => {
  const { getByTestId } = render(wrapper);
  await waitFor(() => {
    expect(getByTestId('automationName')).toHaveTextContent('help workflow');
  });
});

test('it should have a help button that redirects to help page', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('helpButton')).toBeInTheDocument();
});

test('it should have a preview button', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('previewButton')).toBeInTheDocument();
});

test('it should have save as draft button', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('saveDraftButton')).toBeInTheDocument();
});

test('click on preview button should open simulator', () => {
  const { getByTestId } = render(wrapper);
  fireEvent.click(getByTestId('previewButton'));
  expect(getByTestId('beneficiaryName')).toHaveTextContent('Beneficiary');
});
