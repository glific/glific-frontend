import { render, screen, fireEvent } from '@testing-library/react';

import { RadioInput } from './RadioInput';

describe('<RadioInput />', () => {
  const props: any = {
    form: { touched: {}, errors: {}, values: {}, setFieldValue: jest.fn(), dirty: {} },
    field: { name: 'radioInput' },
  };

  it('Render radio component', () => {
    render(<RadioInput {...props} />);

    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('Render radio component with default and select yes radio', () => {
    render(<RadioInput {...props} />);

    const radio = screen.getByText('Yes');

    expect(radio).toBeInTheDocument();
    fireEvent.click(radio);
  });

  it('Render radio component and return selected value as callback', () => {
    props.handleChange = jest.fn();
    render(<RadioInput {...props} />);

    const radioYes = screen.getByText('Yes');
    const radioNo = screen.getByText('No');

    expect(radioYes).toBeInTheDocument();
    expect(radioNo).toBeInTheDocument();
    fireEvent.click(radioYes);
    fireEvent.click(radioNo);

    expect(props.handleChange).toBeCalled();
  });

  it('Render radio component with column-wise and with radio title', () => {
    props.radioTitle = 'Radio Title';

    render(<RadioInput {...props} />);

    expect(screen.getByText('Radio Title')).toBeInTheDocument();
  });

  it('Render radio component with error values', () => {
    props.form.errors = { radioInput: 'Required' };
    props.form.touched = { radioInput: true };

    render(<RadioInput {...props} />);

    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
