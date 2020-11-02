import React from 'react';
import { shallow } from 'enzyme';
import { Button } from './Button';

describe('<Button />', () => {
  let isClicked = false;
  const buttonCallback = () => {
    isClicked = true;
  };

  it('renders <Button /> component', () => {
    const wrapper = shallow(<Button>My Button</Button>);
    expect(wrapper).toBeTruthy();
  });

  it('should have correct label', () => {
    const wrapper = shallow(<Button>My Button</Button>);
    expect(wrapper.text()).toEqual('My Button');
  });

  it('should trigger onclick callback when clicked', () => {
    const wrapper = shallow(<Button onClick={buttonCallback}>My Button</Button>);
    wrapper.invoke('onClick')();
    expect(isClicked).toEqual(true);
  });
});
