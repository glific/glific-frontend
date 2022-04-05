import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';

import { responseData, responseData1 } from 'mocks/AddVariables';
import { AddVariables } from './AddVariables';

jest.mock('axios');

const setVariableMock = jest.fn();

const defaultProps = {
  setVariable: setVariableMock,
  handleCancel: jest.fn(),
  template: { body: 'Hi {{1}}, Please find the attached bill.', numberParameters: 1 },
  updateEditorState: jest.fn(),
  variableParams: jest.fn(),
  variableParam: ['this', '4563', '5 minutes'],
};

const wrapper = (
  <MockedProvider>
    <MemoryRouter>
      <AddVariables {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

const axiosApiCall = async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(responseData1));
  axios.get.mockImplementationOnce(() => Promise.resolve(responseData));
};

test('it should render variable options and save the form', async () => {
  axiosApiCall();
  const { getByTestId, getByText } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

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

  await waitFor(() => {
    expect(setVariableMock).toHaveBeenCalledWith(false);
  });
});

test('cancel button clicked', async () => {
  axiosApiCall();
  const { container, getByTestId, getByText } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Cancel'));
});
