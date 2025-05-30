import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { backspace } from 'common/test-utils';
import { Calendar } from './Calendar';
import dayjs from 'dayjs';

afterEach(() => {
  (window as any).matchMedia = null;
});

const setFieldValueMock = vi.fn();
describe('<Calendar />', () => {
  const getProps = () => ({
    name: 'dateFrom',
    type: 'date',
    placeholder: 'Date from',
    label: 'Date range',
    field: { name: 'example', value: dayjs() },
    form: {
      dirty: false,
      touched: {},
      errors: {},
      setFieldValue: setFieldValueMock,
    },
  });

  const wrapper = <Calendar {...getProps()} />;

  it('renders <Calendar /> component', async () => {
    render(wrapper);
    const authContainer = screen.getByTestId('date-picker-inline');
    expect(authContainer).toHaveTextContent('Date from');
  });

  it('test empty date event', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('Date from');
    const now = dayjs(new Date()).format('MM/DD/YYYY');
    expect(input).toHaveValue(now);
  });

  it('test date change event', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('Date from');
    if (input) {
      fireEvent.change(input, { target: { value: '09/03/2020' } });
    }
    expect(setFieldValueMock).toHaveBeenCalled();
  });

  it('should set the field value to null if no date is passed', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('Date from');
    if (input) {
      fireEvent.change(input, { target: { value: '1' } });
    }
    backspace(input);

    expect(setFieldValueMock).toBeCalledWith('example', null);
  });

  it('should set the field value to null if no date is passed', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('Date from');
    if (input) {
      fireEvent.change(input, { target: { value: '1' } });
    }
    backspace(input);

    expect(setFieldValueMock).toBeCalledWith('example', null);
  });

  it('should show error if error is passed', async () => {
    const props = getProps();
    props.form.errors = {
      example: 'Please enter correct date',
    };
    props.form.touched = {
      example: true,
    };

    render(<Calendar {...props} />);
    expect(screen.getByText('Please enter correct date')).toBeInTheDocument();
  });

  it('should call open the calendar if input is clicked', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('Date from');
    if (input) {
      fireEvent.click(input);
    }
    expect(screen.getByTestId('sentinelStart')).toBeInTheDocument();
  });

  it('should close the calendar if we click escape', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('Date from');
    if (input) {
      fireEvent.click(input);
      expect(screen.getByTestId('sentinelStart')).toBeInTheDocument();

      fireEvent.keyDown(input, {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        charCode: 27,
      });
    }
    await waitFor(() => {
      expect(screen.queryByTestId('sentinelStart')).not.toBeInTheDocument();
    });
  });
});
