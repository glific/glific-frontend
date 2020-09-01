import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { shallow } from 'enzyme';
import { ColorPicker } from './ColorPicker';

describe('<ColorPicker />', () => {
  const props = {
    colorCode: '#0C976D',
    helperText: 'Tag color',
    field: { name: 'example', value: null },
  };

  const wrapper = shallow(<ColorPicker {...props} />);

  it('renders <ColorPicker /> component', () => {
    expect(wrapper).toBeTruthy();
  });
});
