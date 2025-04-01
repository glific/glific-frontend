import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
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
  validateTrigger,
} from 'mocks/Trigger';
import { Trigger } from './Trigger';
import dayjs from 'dayjs';
import utc from 'dayjs';
import { conversationMock } from 'mocks/Chat';
dayjs.extend(utc);

const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
}));
const notificationSpy = vi.spyOn(Notification, 'setNotification');

const MOCKS = [...LIST_ITEM_MOCKS, ...SearchMocks];

beforeEach(() => {
  mockUseLocationValue.state = null;
  cleanup();
});

describe('it creates a new trigger', () => {
  const CREATE_MOCKS = [
    ...MOCKS,
    validateTrigger('2', {
      errors: null,
      success: true,
    }),
    validateTrigger('1', {
      __typename: 'ValidateTriggerResult',
      errors: [
        {
          key: 'warning',
          message: 'The first message node is not an HSM template',
        },
      ],
      success: false,
    }),
    createTriggerQuery,
  ];
  const wrapper = (
    <MockedProvider mocks={CREATE_MOCKS} addTypename={false}>
      <MemoryRouter initialEntries={['/trigger/add']}>
        <Routes>
          <Route path="trigger/add" element={<Trigger />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  test('it should create a new trigger', async () => {
    render(wrapper);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add a new trigger')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Select flow')).toBeInTheDocument();
    });

    const autoCompletes = screen.getAllByRole('combobox');

    autoCompletes[0].focus();
    fireEvent.keyDown(autoCompletes[0], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Help Workflow'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Warning: The first message node is not an HSM template')).toBeInTheDocument();
    });

    autoCompletes[0].focus();
    fireEvent.keyDown(autoCompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('SoL Feedback'), { key: 'Enter' });

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: dayjs().format('MM/DD/YYYY') } });
    fireEvent.change(inputs[1], { target: { value: dayjs().add(1, 'day').format('MM/DD/YYYY') } });
    fireEvent.change(inputs[2], { target: { value: '10:00 PM' } });

    await waitFor(() => {
      expect(inputs[0]).toHaveValue(dayjs().format('MM/DD/YYYY'));
    });

    autoCompletes[1].focus();
    fireEvent.keyDown(autoCompletes[1], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Hourly'), { key: 'Enter' });

    autoCompletes[2].focus();
    fireEvent.keyDown(autoCompletes[2], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('1 AM'), { key: 'Enter' });
    fireEvent.click(screen.getByText('3 AM'), { key: 'Enter' });

    autoCompletes[3].focus();
    fireEvent.keyDown(autoCompletes[3], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Group 1'), { key: 'Enter' });

    await waitFor(() => {
      expect(autoCompletes[1]).toHaveValue('Hourly');
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger created successfully!');
    });
  });
});

describe('trigger with daily frequency', () => {
  const frequencyDailyMocks = [...MOCKS, getTriggerQuery('daily')];
  mockUseLocationValue.state = 'copy';

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter initialEntries={['/trigger/1/edit']}>
        <Routes>
          <Route path="trigger/add" element={<Trigger />} />
          <Route path="trigger/:id/edit" element={<Trigger />} />
        </Routes>
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
  const frequencyDailyMocks = [...MOCKS, getTriggerQuery('none'), updateTriggerQuery];

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter initialEntries={['/trigger/1/edit']}>
        <Routes>
          <Route path="trigger/add" element={<Trigger />} />
          <Route path="trigger/:id/edit" element={<Trigger />} />
        </Routes>
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
  const mocks = [...MOCKS, hourlyTrigger()];

  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={['/trigger/1/edit']}>
        <Routes>
          <Route path="trigger/add" element={<Trigger />} />
          <Route path="trigger/:id/edit" element={<Trigger />} />
        </Routes>
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
    ...MOCKS,
    updateTriggerWeeklyQuery,
    deleteTriggerQuery,
    conversationMock({ contactOpts: { limit: 25 }, filter: {}, messageOpts: { limit: 20 } }),
  ];

  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={['/trigger/1/edit']}>
        <Routes>
          <Route path="trigger/add" element={<Trigger />} />
          <Route path="trigger/:id/edit" element={<Trigger />} />
        </Routes>
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
