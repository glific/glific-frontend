import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { CollectionList } from './CollectionList';
import { countGroupQuery, filterGroupQuery, getGroupContactsQuery } from '../../../mocks/Group';
import { MemoryRouter } from 'react-router';
import { getContactsQuery } from '../../../mocks/Contact';
import { setUserSession } from '../../../services/AuthService';
import { getCurrentUserQuery } from '../../../mocks/User';
import * as SearchDialogBox from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import * as MessageDialog from '../../../components/UI/MessageDialog/MessageDialog';
import { getPublishedFlowQuery } from '../../../mocks/Flow';

const mocks = [
  countGroupQuery,
  filterGroupQuery,
  filterGroupQuery,
  getPublishedFlowQuery,
  getPublishedFlowQuery,
  getGroupContactsQuery,
  getContactsQuery,
  getCurrentUserQuery,
];

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <CollectionList />
    </MockedProvider>
  </MemoryRouter>
);

describe('<CollectionList />', () => {
  test('should render CollectionList', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Groups')).toBeInTheDocument();
    });

    // TODO: test flows

    // TODO: test delete
  });

  test('it should have add contact to collection dialog box ', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[0]);
    });

    expect(getByText('Add contacts to the collection')).toBeInTheDocument();
  });

  test('it should have send message dialog box ', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));
    const { getByText, getAllByTestId, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Send a message')).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('MenuItem')[0]);
    });

    expect(getByText('Send message to collection')).toBeInTheDocument();

    fireEvent.click(getByTestId('closeButton'));
  });

  test('it should have start flow dialog box ', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));
    const { getByText, getAllByTestId, getAllByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Start a flow')).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('MenuItem')[1]);
    });
    expect(getAllByText('Select a flow')[0]).toBeInTheDocument();
  });

  test('add contacts to collection', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));

    const spy = jest.spyOn(SearchDialogBox, 'SearchDialogBox');
    spy.mockImplementation((props: any) => {
      const { handleCancel, onChange } = props;
      return (
        <div data-testid="searchDialogBox">
          <input onChange={(value) => onChange(value)} />
          <button onClick={() => handleCancel()}></button>
        </div>
      );
    });

    const { getByText, getAllByTestId, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[0]);
    });
    fireEvent.click(getByTestId('searchDialogBox').querySelector('button'));
  });

  test('send message to collection', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));

    const spy = jest.spyOn(MessageDialog, 'MessageDialog');
    spy.mockImplementation((props: any) => {
      const { onSendMessage } = props;
      return <div data-testid="messageDialog" onClick={() => onSendMessage('hello')}></div>;
    });

    const { getByText, getAllByTestId, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.click(getAllByTestId('MenuItem')[0]);
    });

    fireEvent.click(getByTestId('messageDialog'));
  });
});
