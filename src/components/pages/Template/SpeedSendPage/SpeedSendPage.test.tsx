import React from 'react';
import { shallow } from 'enzyme';
import { SpeedSendPage } from './SpeedSendPage';
import { SpeedSendList } from '../../../../containers/Template/SpeedSend/SpeedSendList/SpeedSendList';

const wrapper = shallow(<SpeedSendPage />);

describe('<SpeedSendPage />', () => {
  it('should display the Speed Send Page', () => {
    expect(wrapper.find(SpeedSendList).exists()).toBe(true);
  });
});
