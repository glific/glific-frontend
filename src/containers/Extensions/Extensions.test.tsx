import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { getOrganizationExtension, createExtension, updateExtension } from '../../mocks/Extension';
import { setUserSession } from '../../services/AuthService';
import { Extensions } from './Extensions';

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
const mocks = [getOrganizationExtension, createExtension, updateExtension];
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
  render(wrapper);
  await waitFor(() => {});
  expect(screen.getByText('Add extension code')).toBeInTheDocument();
  const inputElements = screen.getAllByRole('textbox');

  await waitFor(() => {
    fireEvent.change(inputElements[0], { target: { value: 'GCS bucket' } });
    fireEvent.change(inputElements[1], {
      target: {
        value: 'defmodule Glific.Test.Extension, do :def default_phone(), do: %{phone: 9876543210}',
      },
    });
  });

  const checkboxElement = screen.getAllByRole('checkbox');

  await waitFor(() => {
    fireEvent.change(checkboxElement[0], { target: { value: 'false' } });
  });
  await waitFor(() => {
    const submitButton = screen.getByText('Save');
    expect(submitButton).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(submitButton);
  });
});

test('it should render filled form with extension details', async () => {
  const editProps = { ...props };
  editProps.match.params = { id: '1' };
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Extensions {...editProps} />
    </MockedProvider>
  );
  await waitFor(() => {});

  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);

  await waitFor(() => {});

  const submit = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(submit);

  await waitFor(() => {});
});
