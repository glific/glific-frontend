import React from 'react';
import { shallow } from 'enzyme';
import { HSMPage } from './HSMPage';
import { HSMList } from '../../../../containers/Template/HSM/HSMList/HSMList';

const wrapper = shallow(<HSMPage />);

describe('<HSMPage />', () => {
  it('should display the HSM Page', () => {
    expect(wrapper.find(HSMList).exists()).toBe(true);
  });
});
