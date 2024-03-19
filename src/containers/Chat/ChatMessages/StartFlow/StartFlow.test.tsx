import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { setNotification } from 'common/notification';
import StartAFlow from './StartFlow';
import {
  addFlowToCollectionQuery,
  addFlowToContactQuery,
  addFlowToWAGroupQuery,
  getPublishedFlowQuery,
} from 'mocks/Flow';

const mocks = [
  getPublishedFlowQuery,
  addFlowToContactQuery,
  addFlowToCollectionQuery,
  addFlowToWAGroupQuery,
];

const setShowFlowDialogMock = vi.fn();

afterEach(cleanup);

const renderWrapper = (props?: any) => {
  let defaultProps = {
    collectionId: '',
    entityId: '1',
    groups: false,
    setShowFlowDialog: setShowFlowDialogMock,
    ...props,
  };

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <StartAFlow {...defaultProps} />
    </MockedProvider>
  );
};

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

test('it should have start a flow dialog box ', async () => {
  const { getByText, getByTestId } = render(renderWrapper());

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });
  expect(getByText('Select flow')).toBeInTheDocument();
});

test('click on cancel button ', async () => {
  const { getByText, getByTestId } = render(renderWrapper());

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Cancel'));

  expect(setShowFlowDialogMock).toHaveBeenCalled();
});

test('change value in dialog box', async () => {
  const { getByTestId, getByRole, getByText } = render(renderWrapper());

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(getByText('Help Workflow'));

  await waitFor(() => {
    expect(getByRole('combobox')).toHaveValue('Help Workflow');
  });
});

test('should start a flow for contact', async () => {
  const { getByTestId, getByText, getByRole } = render(renderWrapper());

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(getByText('Help Workflow'));

  await waitFor(() => {
    expect(getByRole('combobox')).toHaveValue('Help Workflow');
  });

  fireEvent.click(getByText('Start'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('should start a flow for collection', async () => {
  const { getByTestId, getByText, getByRole } = render(
    renderWrapper({ collectionId: '1', entityId: '' })
  );

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(getByText('Help Workflow'));

  await waitFor(() => {
    expect(getByRole('combobox')).toHaveValue('Help Workflow');
  });

  fireEvent.click(getByText('Start'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('should start a flow for whatsapp group', async () => {
  const { getByTestId, getByText, getByRole } = render(
    renderWrapper({ collectionId: '', entityId: '1', groups: true })
  );

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  const autocomplete = getByTestId('autocomplete-element');
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(getByText('Help Workflow'));

  await waitFor(() => {
    expect(getByRole('combobox')).toHaveValue('Help Workflow');
  });

  fireEvent.click(getByText('Start'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});
