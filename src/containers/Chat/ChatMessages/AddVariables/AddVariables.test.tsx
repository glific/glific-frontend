import { act, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';

import { AddVariables } from './AddVariables';
import { FLOW_EDITOR_API } from '../../../../config';
import { responseData, responseData1 } from '../../../../mocks/AddVariables';

jest.mock('axios', () => {
  return {
    get: jest.fn(),
  };
});

const setVariableMock = jest.fn();
const mocks = [FLOW_EDITOR_API];

const defaultProps = {
  setVariable: setVariableMock,
  handleCancel: jest.fn(),
  bodyText: 'Your OTP for {{1}} is {{2}}. This is valid for {{3}}.',
  updateEditorState: jest.fn(),
  variableParams: jest.fn(),
  variableParam: ['this', '4563', '5 minutes'],
};

const wrapper = (
  <MockedProvider>
    <MemoryRouter>
      <AddVariables {...defaultProps} mocks={mocks} />
    </MemoryRouter>
  </MockedProvider>
);

const whenStable = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

test('it should render variable options and save the form', async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(responseData1));

  axios.get.mockImplementationOnce(() => Promise.resolve(responseData));

  const { getByTestId, getByText } = render(wrapper);

  const getSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce(responseData);
  await whenStable();

  expect(getByTestId('variablesDialog')).toBeInTheDocument();

  fireEvent.click(getByText('Done'));

  getSpy.mockRestore();
});
