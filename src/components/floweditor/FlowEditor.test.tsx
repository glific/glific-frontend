import React from 'react';
import { FlowEditor } from './FlowEditor';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { getFlowDetailsQuery, publishFlow } from '../../mocks/Flow';
import { conversationQuery } from '../../mocks/Chat';
import {
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription,
} from '../../mocks/Simulator';

const mocks = [
  getFlowDetailsQuery,
  conversationQuery,
  simulatorReleaseSubscription,
  simulatorReleaseQuery,
  simulatorGetQuery,
  publishFlow,
];
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <FlowEditor match={{ params: { uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676' } }} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should display the flowEditor', async () => {
  const { container } = render(wrapper);
  await waitFor(() => {
    expect(container.querySelector('#flow')).toBeInTheDocument();
  });
});

test('it should have a done button that redirects to flow page', async () => {
  const { getByTestId } = render(wrapper);
  await waitFor(() => {
    expect(getByTestId('button')).toBeInTheDocument();
  });
});

test('it should display name of the flow', async () => {
  const { getByTestId } = render(wrapper);
  await waitFor(() => {
    expect(getByTestId('flowName')).toHaveTextContent('help workflow');
  });
});

test('it should have a help button that redirects to help page', async () => {
  const { getByTestId } = render(wrapper);
  await waitFor(() => {
    expect(getByTestId('helpButton')).toBeInTheDocument();
  });
});

test('it should have a preview button', async () => {
  const { getByTestId } = render(wrapper);
  await waitFor(() => {
    expect(getByTestId('previewButton')).toBeInTheDocument();
  });
});

test('it should have save as draft button', async () => {
  const { getByTestId } = render(wrapper);
  await waitFor(() => {
    expect(getByTestId('saveDraftButton')).toBeInTheDocument();
  });
});

test('click on preview button should open simulator', async () => {
  const { getByTestId } = render(wrapper);
  fireEvent.click(getByTestId('previewButton'));
  await waitFor(() => {
    expect(getByTestId('beneficiaryName')).toHaveTextContent('Beneficiary');
  });
});

test('publish flow which has error', async () => {
  const { getByTestId } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('button')).toBeInTheDocument();
    fireEvent.click(getByTestId('button'));

    expect(getByTestId('ok-button')).toBeInTheDocument();
    fireEvent.click(getByTestId('ok-button'));
  });
});

test('start with a keyword message if the simulator opens in floweditor screen', async () => {
  const { getByTestId } = render(wrapper);
  fireEvent.click(getByTestId('previewButton'));

  await waitFor(() => {
    expect(getByTestId('beneficiaryName'));
    // expect(getByText('draft:help'));
  });
});

test('test if XMLHTTPRequest works ', async () => {
  const { getByTestId } = render(wrapper);
  fireEvent.click(getByTestId('previewButton'));

  const newRequest = new XMLHttpRequest();
  newRequest.open('GET', 'www.glific.org');
  newRequest.send();
  await waitFor(() => {
    expect(newRequest.readyState).toBe(4);
  });
});
