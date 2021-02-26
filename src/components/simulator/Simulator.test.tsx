import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { Simulator } from './Simulator';
import { MockedProvider } from '@apollo/client/testing';
import { conversationQuery } from '../../mocks/Chat';
import {
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription,
} from '../../mocks/Simulator';

const mockAxios = jest.genMockFromModule('axios');

// this is the key to fix the axios.create() undefined error!
mockAxios.create = jest.fn(() => mockAxios);

const mockSetShowSimulator = jest.fn();

const mocks = [
  conversationQuery,
  simulatorReleaseSubscription,
  simulatorReleaseQuery,
  simulatorGetQuery,
  simulatorGetQuery,
  simulatorGetQuery,
];
const defaultProps = {
  showSimulator: true,
  setShowSimulator: mockSetShowSimulator,
  setSimulatorId: mockSetShowSimulator,
};

const simulator = (
  <MockedProvider mocks={mocks}>
    <Simulator {...defaultProps} />
  </MockedProvider>
);

test('simulator should open on click of simulator icon', async () => {
  const { getByTestId } = render(simulator);
  fireEvent.click(getByTestId('simulatorIcon'));

  await waitFor(() => {
    expect(mockSetShowSimulator).toBeCalled();
  });
});

test('send a message from the simulator', async () => {
  const { getByTestId } = render(simulator);
  let input: any;

  await waitFor(() => {
    input = getByTestId('simulatorInput');
    fireEvent.change(input, { target: { value: 'something' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
  });

  const responseData = { data: {} };
  mockAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
  await waitFor(() => {
    expect(input).toHaveTextContent('');
  });
});

test('click on clear icon closes the simulator', async () => {
  const { getByTestId } = render(simulator);
  await waitFor(() => {
    fireEvent.click(getByTestId('clearIcon'));
  });
  expect(mockSetShowSimulator).toBeCalled();
});
