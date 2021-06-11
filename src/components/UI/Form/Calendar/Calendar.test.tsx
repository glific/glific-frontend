import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { Calendar } from './Calendar';

describe('<Calendar />', () => {
  const props = {
    name: 'dateFrom',
    type: 'date',
    placeholder: 'Date from',

    label: 'Date range',
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: function () {} },
  };

  const wrapper = <Calendar {...props} />;

  it('renders <Calendar /> component', async () => {
    const { findByTestId } = render(wrapper);
    const authContainer = await findByTestId('date-picker-inline');
    expect(authContainer).toHaveTextContent('Date from');
  });

  it('test empty date event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '');
    expect(input).toHaveValue('');
  });

  it('test date change event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '09/03/2020');
    expect(input).toHaveValue('09/03/2020');
  });
});
