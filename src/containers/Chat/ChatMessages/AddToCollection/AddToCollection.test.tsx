import { AddToCollection } from './AddToCollection';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import { getCollectionContactsQuery, updateCollectionContactsQuery } from 'mocks/Collection';
import { getContactsQuery, getContactsSearchQuery } from 'mocks/Contact';
import * as AutoComplete from 'components/UI/Form/AutoComplete/AutoComplete';

const mocks = [
  getCollectionContactsQuery,
  getCollectionContactsQuery,
  getContactsSearchQuery,
  getContactsQuery,
  updateCollectionContactsQuery,
];

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const setDialogMock = vi.fn();
const defaultProps = {
  collectionId: '1',
  setDialog: setDialogMock,
};

afterEach(cleanup);

const addContacts = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <AddToCollection {...defaultProps} />
  </MockedProvider>
);

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

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
  const spy = vi.spyOn(AutoComplete, 'AutoComplete');
  spy.mockImplementation((props: any) => {
    const { form, onChange } = props;

    return (
      <div data-testid="searchDialogBox">
        <input
          onChange={(value) => {
            onChange('glific');
            form.setFieldValue(value);
          }}
        />
      </div>
    );
  });
  const { getByTestId, getByText } = render(addContacts);
  fireEvent.change(getByTestId('searchDialogBox').querySelector('input') as HTMLElement, {
    target: { value: 'change' },
  });

  fireEvent.click(getByText('Save'));
});
