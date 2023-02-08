import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import ToastMessage from './ToastMessage';

vi.useFakeTimers();

describe('<ToastMessage />', () => {
  const mockCallback = vi.fn();
  const wrapper = (props: any) => (
    <ToastMessage {...props} severity={'success'} message={'Saved.'} handleClose={mockCallback} />
  );

  it('should not display toast message if open is false', () => {
    const { container } = render(wrapper({ open: false }));
    expect(container.querySelector('.MuiButtonBase-root')).toBe(null);
  });

  it('should display the message text as passed in the prop', () => {
    const { container } = render(wrapper({ open: true }));
    expect(container.querySelector('.MuiAlert-message')).toHaveTextContent('Saved.');
  });

  it('should check if the callback method is called when close button clicked', () => {
    const { getByTestId } = render(wrapper({ open: true }));
    fireEvent.click(getByTestId('crossIcon'));
    expect(mockCallback).toHaveBeenCalled();
  });

  it('it should rendre with default props', () => {
    const { getByTestId } = render(<ToastMessage message={'Saved.'} handleClose={mockCallback} />);
    fireEvent.click(getByTestId('crossIcon'));
    expect(mockCallback).toHaveBeenCalled();
  });

  // To do: how to check timer in test cases

  // it('should check if the callback method is called after 1 second', async () => {
  //   const { getByTestId } = render(wrapper({ open: true, hideDuration: 1000 }));
  //   vi.runAllTimers();
  //   expect(mockCallback).toHaveBeenCalled();
  // });
});
