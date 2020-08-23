import React from 'react';

import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import ContactBar from './ContactBar';

describe('<ContactBar />', () => {
  const defaultProps = {
    contactName: 'Jane Doe',
    contactId: '2',
  };
  const wrapper = mount(
    <MockedProvider>
      <ContactBar {...defaultProps} />
    </MockedProvider>
  );

  test('it should render the name correctly', () => {
    expect(wrapper.find('h6[data-testid="beneficiaryName"]').text()).toEqual('Jane Doe');
  });
});
