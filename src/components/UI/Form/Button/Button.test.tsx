import { fireEvent, render } from '@testing-library/react';
import { Button } from './Button';

describe('<Button />', () => {
  const buttonCallback = jest.fn();

  const defaultProps = {
    'data-testid': 'button',
    children: 'Button',
    variant: 'contained' as 'contained',
    color: 'primary' as 'primary',
  };

  it('renders <Button /> component', () => {
    const wrapper = render(<Button {...defaultProps}>My Button</Button>);
    expect(wrapper).toBeTruthy();
  });

  it('should have correct label', () => {
    const { getByText } = render(<Button {...defaultProps}>My Button</Button>);
    expect(getByText('My Button')).toBeInTheDocument();
  });

  it('should trigger onclick callback when clicked', () => {
    const { getByTestId } = render(
      <Button onClick={buttonCallback} {...defaultProps}>
        My Button
      </Button>
    );
    fireEvent.click(getByTestId('button'));
    expect(buttonCallback).toBeCalled();
  });
});
