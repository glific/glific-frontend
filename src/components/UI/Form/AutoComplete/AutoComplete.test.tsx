import React from 'react';
import { shallow } from 'enzyme';
import { AutoComplete } from './AutoComplete';

describe('<AutoComplete />', () => {
  const tags: any[] = [
    {
      __typename: 'Tag',
      description: null,
      id: '1',
      label: 'Messages',
    },
  ];
  const wrapper = shallow(<AutoComplete label="Include tags" options={tags} optionLabel="label" />);

  it('renders <AutoComplete /> component', () => {
    expect(wrapper).toBeTruthy();
  });
});
