import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { Group } from './Group';
import { getGroupQuery, getGroupsQuery, getGroupUsersQuery } from '../../mocks/Group';
import { getUsersQuery } from '../../mocks/User';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../../mocks/Organization';
import * as FormLayout from '../Form/FormLayout';

const mocks = [
  getUsersQuery,
  ...getOrganizationQuery,
  getGroupQuery,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
  getGroupQuery, // if you refetch then you need to include same mock twice
  getGroupUsersQuery,
  getGroupUsersQuery,
  ...getGroupsQuery,
];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Group match={{ params: { id: 1 } }} />
  </MockedProvider>
);

describe('<Group />', () => {
  test('should render Group and hit save', async () => {
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Edit group')).toBeInTheDocument();
    });

    // remove first user
    const removeUser = getAllByTestId('deleteIcon');
    UserEvent.click(removeUser[0]);

    // click on SAVE
    const saveButton = screen.getByText('Save');
    await waitFor(() => {
      UserEvent.click(saveButton);
    });
  });

  test('it should call additional query and hit the update users function', async () => {
    const mockCallback = jest.fn();
    const spy = jest.spyOn(FormLayout, 'FormLayout');
    spy.mockImplementation((props: any) => {
      const { additionalQuery } = props;
      return (
        <div
          onClick={() => {
            additionalQuery(['1']);
            mockCallback();
          }}
          data-testid="group"
        >
          <span>Edit group</span>
        </div>
      );
    });

    const { getByTestId } = render(wrapper);
    fireEvent.click(getByTestId('group'));

    await waitFor(() => {
      expect(mockCallback).toBeCalled();
    });
  });
});
