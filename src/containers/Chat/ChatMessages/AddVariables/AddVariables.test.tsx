import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
  bodyText: 'Hi {{1}}, Please find the attached bill.',
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

const axiosApiCall = async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(responseData1));

  axios.get.mockImplementationOnce(() => Promise.resolve(responseData));
};

test('it should render variable options and save the form', async () => {
  axiosApiCall();
  const { container, getByTestId, getByText } = render(wrapper);

  const getSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce(responseData);
  await whenStable();

  expect(getByTestId('variablesDialog')).toBeInTheDocument();
  const autocomplete = screen.getByTestId('AutocompleteInput');
  const input = within(autocomplete).getByRole('textbox');

  autocomplete.focus();
  // assign value to input field
  fireEvent.change(input, { target: { value: '@contact.name' } });
  // navigate to the first item in the autocomplete box
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  // select the first item
  fireEvent.keyDown(autocomplete, { key: 'Enter' });

  fireEvent.click(getByText('Done'));
});

test('cancel button clicked', async () => {
  axiosApiCall();
  const { container, getByTestId, getByText } = render(wrapper);

  const getSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce(responseData);
  await whenStable();

  expect(getByTestId('variablesDialog')).toBeInTheDocument();
  fireEvent.click(getByText('Cancel'));
});
