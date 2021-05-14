import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateTimePicker } from './DateTimePicker';

describe('<DateTimePicker />', () => {
  const props = {
    name: 'dateFrom',
    type: 'date',
    placeholder: 'Date from',
    label: 'Date range',
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: {}, setFieldValue: jest.fn() },
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
  });
});
