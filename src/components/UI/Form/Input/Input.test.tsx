import { render, screen, waitFor } from '@testing-library/react';

import { Input } from './Input';

describe('<Input />', () => {
  const getProps: any = () => ({
    form: { touched: false, errors: {} },
    field: { name: 'input', value: 'default', onBlur: vi.fn() },
    inputLabel: 'Title',
    placeholder: 'Title',
  });
  const input = <Input {...getProps()} />;
  it('renders <Input /> component', () => {
    const { getByTestId } = render(input);
    expect(getByTestId('input')).toBeInTheDocument();
  });

  it('should have correct label', () => {
    const { getByTestId } = render(input);
    expect(getByTestId('inputLabel')).toHaveTextContent('Title');
  });

  it('should have an initial value', () => {
    const { getByDisplayValue } = render(input);
    expect(getByDisplayValue('default')).toBeInTheDocument();
  });

  it('should show the password if togglePassword is enabled', async () => {
    const props = getProps();
    props.togglePassword = true;
    props.type = 'password';
    render(<Input {...props} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('default')).toBeInTheDocument();
    });
  });

  it('should show translation if the value is passed', () => {
    const props = getProps();
    props.translation = 'This is a translation';
    render(<Input {...props} />);
    expect(screen.getByText('This is a translation')).toBeInTheDocument();
  });
});
