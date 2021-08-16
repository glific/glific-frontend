import { AddContactsToCollection } from './AddContactsToCollection';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { setUserSession } from 'services/AuthService';
import { getCollectionContactsQuery, updateCollectionContactsQuery } from 'mocks/Collection';
import { getContactsQuery } from 'mocks/Contact';
import * as AutoComplete from 'components/UI/Form/AutoComplete/AutoComplete';

const mocks = [
  getCollectionContactsQuery,
  getCollectionContactsQuery,
  getContactsQuery,
  updateCollectionContactsQuery,
];

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const setDialogMock = jest.fn();
const defaultProps = {
  collectionId: '1',
  setDialog: setDialogMock,
};

afterEach(cleanup);

const addContacts = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <AddContactsToCollection {...defaultProps} />
  </MockedProvider>
);

test('it should have add contact to collection dialog box ', async () => {
  const { getByText } = render(addContacts);

  expect(getByText('Add contacts to the collection')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Glific User')).toBeInTheDocument();
  });
});

test('click on cancel button ', async () => {
  const { getByText } = render(addContacts);

  fireEvent.click(getByText('Cancel'));

  expect(setDialogMock).toHaveBeenCalled();
});

test('save without changing anything', async () => {
  const { getByText, getByTestId } = render(addContacts);

  await waitFor(() => {
    expect(getByText('Glific User')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Save'));
});

test('change value in dialog box', () => {
  const spy = jest.spyOn(AutoComplete, 'AutoComplete');
  spy.mockImplementation((props: any) => {
    const { form, onChange } = props;

    return (
      <div data-testid="searchDialogBox">
        <input
          onChange={(value) => {
            onChange('hey');
            form.setFieldValue(value);
          }}
        />
      </div>
    );
  });
  const { getByTestId, getByText } = render(addContacts);
  fireEvent.change(getByTestId('searchDialogBox').querySelector('input'), {
    target: { value: 'change' },
  });

  fireEvent.click(getByText('Save'));
});
