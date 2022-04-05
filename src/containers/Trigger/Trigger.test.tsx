import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

import { LIST_ITEM_MOCKS } from 'containers/SettingList/SettingList.test.helper';
import { LIST_ITEM_MOCKS as SearchMocks } from 'containers/Search/Search.test.helper';
import * as AutoComplete from 'components/UI/Form/AutoComplete/AutoComplete';
import { getTriggerQuery, hourlyTrigger } from 'mocks/Trigger';
import { Trigger } from './Trigger';

describe('trigger with daily frequency', () => {
  const frequencyDailyMocks = [getTriggerQuery('daily'), ...LIST_ITEM_MOCKS, ...SearchMocks];

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter initialEntries={[{ state: 'copy' }]}>
        <Trigger match={{ params: { id: '1' } }} />
      </MemoryRouter>
    </MockedProvider>
  );

  test('save functionality', async () => {
    const { getByText, getAllByTestId } = render(frequencyDailyWrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {});
    await waitFor(() => {
      const autoComplete = getAllByTestId('autocomplete-element');
    });

    fireEvent.click(getByText('Save'));
    await waitFor(() => {});
  });
});

describe('trigger with no frequency', () => {
  const frequencyDailyMocks = [getTriggerQuery('none'), ...LIST_ITEM_MOCKS, ...SearchMocks];

  const frequencyDailyWrapper = (
    <MockedProvider mocks={frequencyDailyMocks} addTypename={false}>
      <MemoryRouter>
        <Trigger match={{ params: { id: '1' } }} />
      </MemoryRouter>
    </MockedProvider>
  );

  test('save functionality', async () => {
    const { getByText, getAllByTestId } = render(frequencyDailyWrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {});
    await waitFor(() => {
      const autoComplete = getAllByTestId('autocomplete-element');
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
        <Trigger match={{ params: { id: '1' } }} />
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
  const mocks = [getTriggerQuery('weekly'), ...LIST_ITEM_MOCKS, ...SearchMocks];

  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <Trigger match={{ params: { id: '1' } }} />
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
      const autoComplete = getAllByTestId('autocomplete-element');
    });

    fireEvent.click(getByText('Save'));
    await waitFor(() => {});
  });

  test('should load trigger edit form', async () => {
    const spy = jest.spyOn(AutoComplete, 'AutoComplete');
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
            {options.map((option: any) => (
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
});
