import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { TimePicker } from './TimePicker';

describe('<TimePicker />', () => {
  const props = {
    placeholder: 'TimePicker',
    disabled: false,
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: function () {} },
  };

  const wrapper = <TimePicker {...props} />;

  it('renders <TimePicker /> component', async () => {
    const { findByTestId } = render(wrapper);
    const authContainer = await findByTestId('time-picker');
    expect(authContainer).toHaveTextContent('TimePicker');
  });

  it('test empty time event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '');
    expect(input).toHaveValue('');
  });

  it('test time change event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '09:00 AM');
    expect(input).toHaveValue('09:00 AM');
  });

  it('test display time picker on icon click', async () => {
    render(wrapper);
    const input = screen.getByRole('button');
    fireEvent.click(input);
    expect(screen.getByRole('presentation'));
  });
});

describe('Disable <TimePicker />', () => {
  const props = {
    placeholder: 'TimePicker',
    disabled: true,
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: function () {} },
  };

  const wrapper = <TimePicker {...props} />;

  it('test time change event not allow', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '09:00 AM');
    expect(input).toHaveValue('');
  });

  it('test do not display time picker on icon click', async () => {
    render(wrapper);
    const input = screen.getByRole('button');
    fireEvent.click(input);
    expect(screen.queryAllByTestId('presentation')).toEqual([]);
  });
});
