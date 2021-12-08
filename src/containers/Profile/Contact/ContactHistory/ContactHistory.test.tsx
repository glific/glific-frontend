import { fireEvent, render } from '@testing-library/react';

import { ContactHistory } from './ContactHistory';

const defaultProps = {
  contactId: '1',
};

const wrapper = <ContactHistory {...defaultProps} />;

it('should render ContactDescription', () => {
  const { getByTestId, container } = render(wrapper);
  expect(getByTestId('ContactHistory')).toBeInTheDocument();
  // toggle phone visibility

  //   const togglePhone = screen.getByRole('button');
  //   fireEvent.click(togglePhone);
});
