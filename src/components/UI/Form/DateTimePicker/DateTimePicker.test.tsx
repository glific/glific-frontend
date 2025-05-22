import { render, screen, fireEvent } from '@testing-library/react';
import { DateTimePicker } from './DateTimePicker';
import dayjs from 'dayjs';

afterEach(() => {
  (window as any).matchMedia = null;
});

describe('<DateTimePicker />', () => {
  const onChangeMock = vi.fn();
  const setFieldMock = vi.fn();
  const getProps: any = () => ({
    name: 'dateFrom',
    type: 'date',
    placeholder: 'Date from',
    label: 'Date range',
    field: { name: 'example', value: null },
    form: { dirty: false, touched: {}, errors: {}, setFieldValue: setFieldMock },
    onChange: onChangeMock,
  });

  const wrapper = <DateTimePicker {...getProps()} />;

  it('renders <DateTimePicker /> component', async () => {
    render(wrapper);
    expect(screen.getByTestId('date-picker-inline')).toHaveTextContent('Date from');
  });

  it('test date change event', async () => {
    const container = render(wrapper);
    const dateFrom = container.queryByTestId('Date range');
    if (dateFrom) {
      fireEvent.change(dateFrom, { target: { value: '21/05/2025 10:40 pm' } });
    }

    expect(setFieldMock).toHaveBeenCalled();
    expect(onChangeMock).toHaveBeenCalled();
  });

  it('test date with errors', async () => {
    const props = getProps();
    props.form.errors = { example: 'Date is required' };
    props.form.touched = { example: true };
    render(<DateTimePicker {...props} />);

    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('test date default value', async () => {
    const props = getProps();
    props.field.value = dayjs();
    const container = render(<DateTimePicker {...props} />);
    const dateFrom = container.queryByTestId('Date range');
    expect(dateFrom).toHaveValue();
  });

  it('onChange event will not be called if the prop is not passed', async () => {
    const props = getProps();
    delete props.onChange;
    const container = render(<DateTimePicker {...props} />);
    const dateFrom = container.queryByTestId('Date range');
    if (dateFrom) {
      fireEvent.change(dateFrom, { target: { value: '21/05/2025 10:40 pm' } });
    }
    expect(onChangeMock).toHaveBeenCalled();
  });
});
