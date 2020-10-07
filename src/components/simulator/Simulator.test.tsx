import React from 'react';
import { render, screen, wait, fireEvent, act } from '@testing-library/react';
import { Simulator } from './Simulator';
import { MockedProvider } from '@apollo/client/testing';
import { conversationQuery } from '../../mocks/Chat';

const mockSetShowSimulator = jest.fn();

const mocks = [conversationQuery];
const defaultProps = {
  showSimulator: true,
  setShowSimulator: mockSetShowSimulator,
};

const simulator = (
  <MockedProvider mocks={mocks}>
    <Simulator {...defaultProps} />
  </MockedProvider>
);

test('simulator should open on click of simulator icon', () => {
  const { getByTestId } = render(simulator);
  fireEvent.click(getByTestId('simulatorIcon'));
  expect(mockSetShowSimulator).toBeCalled();
});

test('send a message from the simulator', async () => {
  const { getByTestId } = render(simulator);
  await wait();
  const input = getByTestId('simulatorInput');

  fireEvent.change(input, { target: { value: 'something' } });
  fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

  expect(input).toHaveTextContent('');
});

test('click on clear icon closes the simulator', async () => {
  const { getByTestId } = render(simulator);
  await wait();
  fireEvent.click(getByTestId('clearIcon'));
  expect(mockSetShowSimulator).toBeCalled();
});
