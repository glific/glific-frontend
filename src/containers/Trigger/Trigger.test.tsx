import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import * as Notification from 'common/notification';
import { TRIGGER_MOCKS, createTriggerQuery, getTriggerQuery } from 'mocks/Trigger';
import { Trigger } from './Trigger';
import dayjs from 'dayjs';
import utc from 'dayjs';
import TriggerList from './TriggerList/TriggerList';
import { EXTENDED_TIME_FORMAT, ISO_DATE_FORMAT } from 'common/constants';
import { setOrganizationServices } from 'services/AuthService';
dayjs.extend(utc);

const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

vi.mock('react-router', async () => ({
  ...((await vi.importActual<any>('react-router')) as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
}));
const notificationSpy = vi.spyOn(Notification, 'setNotification');

const MOCKS = TRIGGER_MOCKS;

beforeEach(() => {
  mockUseLocationValue.state = null;
  cleanup();
});

const startDate = dayjs();
const endDate = dayjs().add(1, 'day');
const startTime = dayjs().add(1, 'hour');

const fillForm = async (container: any, frequency: string) => {
  await waitFor(() => {
    expect(screen.getByText('Add a new trigger')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Select flow*')).toBeInTheDocument();
  });

  const autoCompletes = screen.getAllByRole('combobox');

  autoCompletes[0].focus();
  fireEvent.keyDown(autoCompletes[0], { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('SoL Feedback'), { key: 'Enter' });

  const startDateInput = container.queryByTestId('Start date');
  const endDateInput = container.queryByTestId('End date');
  const timeInput = container.queryByTestId('Start time');

  if (startDateInput) {
    fireEvent.change(startDateInput, { target: { value: startDate.format('MM/DD/YYYY') } });
  }

  if (endDateInput) {
    fireEvent.change(endDateInput, { target: { value: endDate.format('MM/DD/YYYY') } });
  }

  if (timeInput) {
    fireEvent.change(timeInput, { target: { value: startTime.format('hh:mm A') } });
  }

  autoCompletes[1].focus();
  fireEvent.keyDown(autoCompletes[1], { key: 'ArrowDown' });
  fireEvent.click(screen.getByText(frequency), { key: 'Enter' });

  autoCompletes[3].focus();
  fireEvent.keyDown(autoCompletes[3], { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('Group 1'), { key: 'Enter' });

  await waitFor(() => {
    expect(autoCompletes[1]).toHaveValue(frequency);
  });
};

const getDates = (startTime: any, startDate: any, endDate: any) => {
  const startAtTime = dayjs(startTime).format(EXTENDED_TIME_FORMAT);
  const startAt = dayjs(`${dayjs(startDate).format(ISO_DATE_FORMAT)}${startAtTime}`).utc();

  return {
    startDate: dayjs(startAt).format(ISO_DATE_FORMAT),
    endDate: dayjs(endDate).format(ISO_DATE_FORMAT),
    startTime: dayjs(startAt).utc().set('seconds', 0).format(EXTENDED_TIME_FORMAT),
  };
};

const wrapper = (mock?: any) => (
  <MockedProvider mocks={mock ? [...MOCKS, mock] : MOCKS} addTypename={false}>
    <MemoryRouter initialEntries={['/trigger/add']}>
      <Routes>
        <Route path="trigger/add" element={<Trigger />} />
        <Route path="trigger" element={<TriggerList />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const editWrapper = (mocks?: any) => (
  <MockedProvider mocks={mocks ? [...MOCKS, ...mocks] : MOCKS} addTypename={false}>
    <MemoryRouter initialEntries={['/trigger/1/edit']}>
      <Routes>
        <Route path="trigger/:id/edit" element={<Trigger />} />
        <Route path="trigger" element={<TriggerList />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const createTriggerPayload = {
  isActive: true,
  isRepeating: true,
  flowId: '2',
  groupIds: [1],
  groupType: 'WABA',
  addRoleIds: [],
  deleteRoleIds: [],
};

describe('add mode', () => {
  test('it creates a hourly trigger', async () => {
    const createMock = createTriggerQuery({
      days: [],
      hours: [1, 3],
      frequency: 'hourly',
      ...createTriggerPayload,
      ...getDates(startTime, startDate, endDate),
    });

    const container = render(wrapper(createMock));
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add a new trigger')).toBeInTheDocument();
    });

    const autoCompletes = screen.getAllByRole('combobox');

    autoCompletes[0].focus();
    fireEvent.keyDown(autoCompletes[0], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Help Workflow'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Warning: The first message node is not an HSM template')).toBeInTheDocument();
    });

    await fillForm(container, 'Hourly');

    autoCompletes[2].focus();
    fireEvent.keyDown(autoCompletes[2], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('1 AM'), { key: 'Enter' });
    fireEvent.click(screen.getByText('3 AM'), { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger created successfully!');
    });
  });

  test('it creates a daily trigger', async () => {
    const startDate = dayjs();
    const endDate = dayjs().add(1, 'day');
    const startTime = dayjs().add(1, 'hour');

    const createMock = createTriggerQuery({
      days: [],
      hours: [],
      frequency: 'daily',
      ...createTriggerPayload,
      ...getDates(startTime, startDate, endDate),
    });

    const container = render(wrapper(createMock));
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await fillForm(container, 'Daily');
    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger created successfully!');
    });
  });

  test('it creates a weekly trigger', async () => {
    const startDate = dayjs();
    const endDate = dayjs().add(1, 'day');
    const startTime = dayjs().add(1, 'hour');

    const createMock = createTriggerQuery({
      days: [1, 4],
      hours: [],
      frequency: 'weekly',
      ...createTriggerPayload,
      ...getDates(startTime, startDate, endDate),
    });

    const container = render(wrapper(createMock));
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add a new trigger')).toBeInTheDocument();
    });

    const autoCompletes = screen.getAllByRole('combobox');

    await fillForm(container, 'Weekly');

    autoCompletes[2].focus();
    fireEvent.keyDown(autoCompletes[2], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Monday'), { key: 'Enter' });
    fireEvent.click(screen.getByText('Thursday'), { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger created successfully!');
    });
  });

  test('it creates a monthly trigger', async () => {
    const startDate = dayjs();
    const endDate = dayjs().add(1, 'day');
    const startTime = dayjs().add(1, 'hour');

    const createMock = createTriggerQuery({
      days: [1, 4],
      hours: [],
      frequency: 'monthly',
      ...createTriggerPayload,
      ...getDates(startTime, startDate, endDate),
    });

    const container = render(wrapper(createMock));

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add a new trigger')).toBeInTheDocument();
    });
    const autoCompletes = screen.getAllByRole('combobox');

    await fillForm(container, 'Monthly');

    autoCompletes[2].focus();
    fireEvent.keyDown(autoCompletes[2], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('1'), { key: 'Enter' });
    fireEvent.click(screen.getByText('4'), { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger created successfully!');
    });
  });

  test('it should validate start and end date', async () => {
    const container = render(wrapper());

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add a new trigger')).toBeInTheDocument();
    });

    const startDateInput = container.queryByTestId('Start date');
    const endDateInput = container.queryByTestId('End date');
    const timeInput = container.queryByTestId('Start time');

    if (startDateInput) {
      fireEvent.change(startDateInput, { target: { value: dayjs().format('MM/DD/YYYY') } });
    }

    if (endDateInput) {
      fireEvent.change(endDateInput, { target: { value: dayjs().format('MM/DD/YYYY') } });
    }

    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: dayjs().subtract(1, 'hour').format('hh:mm A') } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));
    await waitFor(() => {
      expect(screen.getByText('Start time should be greater than current time')).toBeInTheDocument();
    });

    if (startDateInput) {
      fireEvent.change(startDateInput, { target: { value: dayjs().add(1, 'day').format('MM/DD/YYYY') } });
    }
    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.getByText('End date should be greater than the start date')).toBeInTheDocument();
    });
  });
});

describe('edit mode', () => {
  test('should renders form for hourly triggers', async () => {
    render(
      editWrapper([
        getTriggerQuery('hourly', {
          flow: {
            id: '1',
          },
          groups: ['Group 1'],
          hours: [0, 1],
        }),
      ])
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Edit trigger')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toHaveValue('Help Workflow');
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[1]).toHaveValue('Hourly');
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger edited successfully!');
    });
  });

  test('should renders form for daily triggers', async () => {
    render(
      editWrapper([
        getTriggerQuery('daily', {
          flow: {
            id: '1',
          },
          groups: ['Group 1'],
          hours: [],
        }),
      ])
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Edit trigger')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[1]).toHaveValue('Daily');
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toHaveValue('Help Workflow');
    });
  });

  test('should renders form for weekly triggers', async () => {
    render(
      editWrapper([
        getTriggerQuery('weekly', {
          flow: {
            id: '1',
          },
          groups: ['Group 1'],
          days: [3, 4],
        }),
      ])
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Edit trigger')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toHaveValue('Help Workflow');
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[1]).toHaveValue('Weekly');
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      expect(screen.getByText('Thursday')).toBeInTheDocument();
    });
  });

  test('should renders form for monthly triggers', async () => {
    render(
      editWrapper([
        getTriggerQuery('monthly', {
          flow: {
            id: '1',
          },
          groups: ['Group 1'],
          days: [2, 3],
        }),
      ])
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Edit trigger')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toHaveValue('Help Workflow');
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[1]).toHaveValue('Monthly');
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  test('it deletes a trigger', async () => {
    render(
      editWrapper([
        getTriggerQuery('monthly', {
          flow: {
            id: '1',
          },
          groups: ['Group 1'],
          days: [2, 3],
        }),
      ])
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Edit trigger')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('remove-icon'));

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete the trigger?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger deleted successfully');
    });
  });
});

describe('copy mode', async () => {
  test('it copies a trigger', async () => {
    mockUseLocationValue.state = 'copy';

    const container = render(
      editWrapper([
        getTriggerQuery('hourly', {
          flow: {
            id: '1',
          },
          groups: ['Group 1'],
          hours: [0, 1],
          startAt: startTime.format('YYYY-MM-DDTHH:mm:ss[Z]'),
          startDate: startDate.format('MM/DD/YYYY'),
          endDate: endDate.format('MM/DD/YYYY'),
        }),
        createTriggerQuery({
          ...createTriggerPayload,
          ...getDates(startTime, startDate, endDate),
          days: [],
          hours: [0, 1],
          frequency: 'hourly',
          groupType: 'WABA',
          flowId: '1',
        }),
      ])
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Copy trigger')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toHaveValue('Help Workflow');
    });

    const startDateInput = container.queryByTestId('Start date') as HTMLInputElement;
    const endDateInput = container.queryByTestId('End date') as HTMLInputElement;
    const timeInput = container.queryByTestId('Start time') as HTMLInputElement;
    await waitFor(() => {
      expect(startDateInput?.value).toBe('');
      expect(endDateInput?.value).toBe('');
      expect(timeInput?.value).toBe('');
    });

    if (startDateInput) {
      fireEvent.change(startDateInput, { target: { value: startDate.format('MM/DD/YYYY') } });
    }

    if (endDateInput) {
      fireEvent.change(endDateInput, { target: { value: endDate.format('MM/DD/YYYY') } });
    }

    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: startTime.format('hh:mm A') } });
    }

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.getByText('Copy trigger')).toBeInTheDocument();
    });
  });
});

describe('Whatsapp group collections', () => {
  setOrganizationServices('{"__typename":"OrganizationServicesResult","whatsappGroupEnabled":true}');

  test('it creates a trigger for whatsapp group', async () => {
    const startDate = dayjs();
    const endDate = dayjs().add(1, 'day');
    const startTime = dayjs().add(1, 'hour');

    const createMock = createTriggerQuery({
      ...createTriggerPayload,
      ...getDates(startTime, startDate, endDate),
      days: [],
      hours: [],
      frequency: 'daily',
      groupType: 'WA',
    });

    const container = render(wrapper(createMock));

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add a new trigger')).toBeInTheDocument();
    });

    await fillForm(container, 'Daily');

    fireEvent.click(screen.getByText('WhatsApp Group Collections'));

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Trigger created successfully!');
    });
  });

  test('it edits flow in edit mode', async () => {
    render(
      editWrapper([
        getTriggerQuery('hourly', {
          flow: {
            id: '1',
          },
          groups: ['Group 1'],
          hours: [0, 1],
          groupType: 'WA',
        }),
      ])
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Edit trigger')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toHaveValue('Help Workflow');
    });

    const radioButton = screen.getByRole('radio', { name: /WhatsApp Group Collections/i });

    await waitFor(() => {
      expect(radioButton).toBeChecked();
    });
  });
});
