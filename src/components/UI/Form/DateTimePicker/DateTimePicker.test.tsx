import { render, screen, fireEvent } from '@testing-library/react';

import { DateTimePicker } from './DateTimePicker';

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
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '14/05/2021 10:50 AM' } });
    expect(input).toHaveValue('14/05/2021⁩ ⁦10:50⁩ ⁦AM');

    expect(setFieldMock).toBeCalled();
    expect(onChangeMock).toBeCalled();
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
    props.field.value = new Date();
    render(<DateTimePicker {...props} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue();
  });

  it('onChange event will not be called if the prop is not passed', async () => {
    const props = getProps();
    delete props.onChange;
    render(<DateTimePicker {...props} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '14/05/2021 10:50 AM' } });
    expect(onChangeMock).toBeCalledTimes(1);
  });
});
