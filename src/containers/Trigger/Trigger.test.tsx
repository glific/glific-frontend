import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';

import { LIST_ITEM_MOCKS } from 'containers/SettingList/SettingList.test.helper';
import { LIST_ITEM_MOCKS as SearchMocks } from 'containers/Search/Search.test.helper';
import * as Notification from 'common/notification';
import {
  createNoFrequencyTriggerQuery,
  createTriggerQuery,
  getTriggerQuery,
  hourlyTrigger,
  updateTriggerQuery,
  validateTriggerQuery,
} from 'mocks/Trigger';
import { Trigger } from './Trigger';
import dayjs from 'dayjs';
import utc from 'dayjs';
dayjs.extend(utc);

describe('copy triggers', () => {
  const frequencyDailyMocks = [
    getTriggerQuery('daily'),
    ...LIST_ITEM_MOCKS,
    ...SearchMocks,
    createTriggerQuery,
  ];

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter initialEntries={[{ pathname: '/trigger/1/edit', state: 'copy' }]}>
        <Routes>
          <Route path="trigger/:id/edit" element={<Trigger />} />
          <Route path="trigger" element={<div>Trigger list screen</div>} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  test('copy a trigger and with daily frequency and save', async () => {
    const notificationMock = vi.fn();
    vi.spyOn(Notification, 'setNotification').mockImplementationOnce(notificationMock);
    const { getByText } = render(frequencyDailyWrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Group 1')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Save'));
    await waitFor(() => {
      expect(notificationMock).toHaveBeenCalledWith('Copy of the trigger has been created!');
      expect(getByText('Trigger list screen')).toBeInTheDocument();
    });
  });
});

describe('trigger validations', () => {
  const frequencyDailyMocks = [
    getTriggerQuery('none'),
    ...LIST_ITEM_MOCKS,
    ...SearchMocks,
    createNoFrequencyTriggerQuery,
    validateTriggerQuery,
  ];

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter>
        <Trigger />
      </MemoryRouter>
    </MockedProvider>
  );

  test('validations while creating a trigger', async () => {
    const notificationMock = vi.fn();
    vi.spyOn(Notification, 'setNotification').mockImplementationOnce(notificationMock);
    const { getByText, queryByText } = render(frequencyDailyWrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Select flow')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Save'));
    await waitFor(() => {
      expect(getByText('Flow is required')).toBeInTheDocument();
      expect(getByText('Start date is required')).toBeInTheDocument();
      expect(getByText('End date is required')).toBeInTheDocument();
      expect(getByText('Time is required.')).toBeInTheDocument();
      expect(getByText('Repeat is required')).toBeInTheDocument();
      expect(getByText('Collection is required')).toBeInTheDocument();
    });

    // select a flow
    const [flows, repeat, days, collection] = screen.getAllByTestId('autocomplete-element');
    flows.focus();
    fireEvent.keyDown(flows, { key: 'ArrowDown' });
    fireEvent.keyDown(flows, { key: 'ArrowDown' });
    fireEvent.keyDown(flows, { key: 'Enter' });

    await waitFor(() => {
      expect(queryByText('Flow is required')).not.toBeInTheDocument();
    });

    const startDate = screen
      .getAllByTestId('date-picker-inline')[0]
      .querySelector('input') as HTMLInputElement;
    const endDate = screen
      .getAllByTestId('date-picker-inline')[1]
      .querySelector('input') as HTMLInputElement;
    const timePicker = screen.getByTestId('time-picker').querySelector('input') as HTMLInputElement;
    fireEvent.change(startDate, { target: { value: '09/03/2030' } });
    fireEvent.change(endDate, { target: { value: '08/03/2030' } });

    await waitFor(() => {
      expect(queryByText('Start date is required')).not.toBeInTheDocument();
      expect(getByText('End date should be greater than the start date')).toBeInTheDocument();
    });

    fireEvent.change(endDate, { target: { value: '10/03/2030' } });
    fireEvent.change(timePicker, { target: { value: '09:00 AM' } });

    await waitFor(() => {
      expect(queryByText('End date should be greater than the start date')).not.toBeInTheDocument();
      expect(queryByText('Time is required.')).not.toBeInTheDocument();
    });

    // update repeat
    repeat.focus();
    fireEvent.keyDown(repeat, { key: 'ArrowDown' });
    fireEvent.keyDown(repeat, { key: 'ArrowDown' });
    fireEvent.keyDown(repeat, { key: 'Enter' });

    // update collection
    collection.focus();
    fireEvent.keyDown(collection, { key: 'ArrowDown' });
    fireEvent.keyDown(collection, { key: 'ArrowDown' });
    fireEvent.keyDown(collection, { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationMock).toHaveBeenCalledWith('Trigger created successfully!');
    });
  });
});
