import { render, screen, fireEvent } from '@testing-library/react';

import { DateTimePicker } from './DateTimePicker';

describe('<DateTimePicker />', () => {
  const props: any = {
    name: 'dateFrom',
    type: 'date',
    placeholder: 'Date from',
    label: 'Date range',
    field: { name: 'example', value: null },
    form: { dirty: false, touched: {}, errors: {}, setFieldValue: jest.fn() },
    onChange: jest.fn(),
  };

  const wrapper = <DateTimePicker {...props} />;

  it('renders <DateTimePicker /> component', async () => {
    render(wrapper);
    expect(screen.getByTestId('date-picker-inline')).toHaveTextContent('Date from');
  });

  it('test date change event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '14/05/2021 10:50 _' } });
    expect(input).toHaveValue('14/05/2021 10:50 _');

    expect(props.form.setFieldValue).toBeCalled();
    expect(props.onChange).toBeCalled();
  });

  it('test date with errors', async () => {
    props.form.errors = { example: 'Date is required' };
    props.form.touched = { example: true };
    render(wrapper);

    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('test date default value', async () => {
    props.field.value = new Date();
    render(wrapper);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue();
  });
});
