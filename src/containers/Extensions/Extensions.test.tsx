import { prettyDOM, render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { getExtension, createExtension } from '../../mocks/Extension';
import { setUserSession } from '../../services/AuthService';
import { Extensions } from './Extensions';

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
const mocks = [getExtension, createExtension];
const props = {
  match: { params: {} },
  openDialog: true,
};
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Extensions {...props} />
  </MockedProvider>
);
test('it should render form correctly', async () => {
  const { container } = render(wrapper);
  await waitFor(() => {});

  expect(screen.getByText('Add extension code')).toBeInTheDocument();
  const inputElements = screen.getAllByRole('textbox');
  console.log(prettyDOM(inputElements[0]));
  await waitFor(() => {
    fireEvent.change(inputElements[0], { target: { value: 'GCS bucket' } });
    fireEvent.change(inputElements[1], {
      target: {
        value: 'defmodule Glific.Test.Extension, do :def default_phone(), do: %{phone: 9876543210}',
      },
    });
  });
  await waitFor(() => {
    const submitButton = screen.getByText('Save');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);
  });
});
