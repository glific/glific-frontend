import React from 'react';
import {render} from "@testing-library/react";
import { AutoComplete } from './AutoComplete';

describe('<AutoComplete />', () => {
  const option: any[] = [
    {
      description: null,
      id: '1',
      label: 'Messages',
    },
  ];
  const props = {
    label: 'Example',
    options: option,
    optionLabel: 'label',
    field: { name: 'example', value: [] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: null },
  };

  const wrapper = render(<AutoComplete {...props} />);

  it('renders <AutoComplete /> component', () => {
    expect(wrapper.getByTestId('autocomplete-element')).toBeInTheDocument();
  });
});
