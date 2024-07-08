import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { LIST_ITEM_MOCKS } from 'containers/SettingList/SettingList.test.helper';
import { LIST_ITEM_MOCKS as SearchMocks } from 'containers/Search/Search.test.helper';
import * as AutoComplete from 'components/UI/Form/AutoComplete/AutoComplete';
import * as Notification from 'common/notification';
import {
  createTriggerQuery,
  deleteTriggerQuery,
  getTriggerQuery,
  hourlyTrigger,
  updateTriggerQuery,
  updateTriggerWeeklyQuery,
} from 'mocks/Trigger';
import { Trigger } from './Trigger';
import dayjs from 'dayjs';
import utc from 'dayjs';
import { conversationMock } from 'mocks/Chat';
dayjs.extend(utc);

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: '1' }),
  };
});

describe('trigger with daily frequency', () => {
  const frequencyDailyMocks = [
    getTriggerQuery('daily'),
    ...LIST_ITEM_MOCKS,
    ...SearchMocks,
    createTriggerQuery,
  ];

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter initialEntries={[{ state: 'copy' }]}>
        <Trigger />
      </MemoryRouter>
    </MockedProvider>
  );

  test('save functionality', async () => {
    const { getByText, getAllByTestId } = render(frequencyDailyWrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getAllByTestId('autocomplete-element')).toHaveLength(4);
    });

    fireEvent.click(getByText('Save'));
    await waitFor(() => {});
  });
});

describe('trigger with no frequency', () => {
  const frequencyDailyMocks = [
    getTriggerQuery('none'),
    ...LIST_ITEM_MOCKS,
    ...SearchMocks,
    updateTriggerQuery,
  ];

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter>
        <Trigger />
      </MemoryRouter>
    </MockedProvider>
  );

  test('save functionality', async () => {
    const { getByText, getAllByTestId } = render(frequencyDailyWrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getAllByTestId('autocomplete-element')).toHaveLength(4);
    });

    fireEvent.click(getByText('Save'));
    await waitFor(() => {});
  });
});

describe('trigger with hourly frequency', () => {
  const mocks = [hourlyTrigger(), ...LIST_ITEM_MOCKS, ...SearchMocks];

  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <Trigger />
      </MemoryRouter>
    </MockedProvider>
  );

  test('should load trigger edit form', async () => {
    const { getByText, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      const formLayout = getByTestId('formLayout');
      expect(formLayout).toHaveTextContent('hours');
    });

    await waitFor(() => {
      expect(getByText('1 AM')).toBeInTheDocument();
      expect(getByText('1 PM')).toBeInTheDocument();
    });
  });
});

describe('trigger with weekly frequency', () => {
  const mocks = [
    getTriggerQuery('weekly'),
    ...LIST_ITEM_MOCKS,
    ...SearchMocks,
    updateTriggerWeeklyQuery,
    deleteTriggerQuery,
    conversationMock({ contactOpts: { limit: 25 }, filter: {}, messageOpts: { limit: 20 } }),
  ];

  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <Trigger />
      </MemoryRouter>
    </MockedProvider>
  );

  test('should load trigger edit form', async () => {
    const { getByText, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      const formLayout = getByTestId('formLayout');
      expect(formLayout).toHaveTextContent('days');
    });

    await waitFor(() => {
      expect(getByText('Tuesday')).toBeInTheDocument();
    });
  });

  test('save functionality', async () => {
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getAllByTestId('autocomplete-element')).toHaveLength(4);
    });

    fireEvent.click(getByText('Save'));
    await waitFor(() => {});
  });

  test('should load trigger edit form', async () => {
    const spy = vi.spyOn(AutoComplete, 'AutoComplete');
    spy.mockImplementation((props: any) => {
      const { form, onChange, options } = props;

      return (
        <div key={form}>
          <select
            key={form}
            data-testid="autoComplete"
            onChange={(event) => {
              onChange({ value: event.target.value });
              form.setFieldValue(event.target.value);
            }}
          >
            {options?.map((option: any) => (
              <option key={option.id ? option.id : option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    });

    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      const formLayout = getAllByTestId('autoComplete');

      fireEvent.change(formLayout[1], { target: { value: 'weekly' } });
      fireEvent.change(formLayout[1], { target: { value: 'daily' } });
    });
  });

  test('it should remove the trigger in edit mode', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    const { getByText, getByTestId } = render(wrapper);
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Edit trigger')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('remove-icon'));
    expect(screen.getByText('Are you sure you want to delete the trigger?')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger deleted successfully');
    });
  });
});
