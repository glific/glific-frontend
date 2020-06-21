import React from 'react';

import { shallow } from 'enzyme';
import ContactBar from './ContactBar';

describe('<ContactBar />', () => {
  const defaultProps = {
    contactName: 'Jane Doe',
  };
  const wrapper = shallow(<ContactBar {...defaultProps} />);

  test('it should render the name correctly', () => {
    expect(wrapper.find('[data-testid="name"]').text()).toEqual('Jane Doe');
  });
});
