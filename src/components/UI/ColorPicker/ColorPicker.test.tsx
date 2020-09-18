import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { ColorPicker } from './ColorPicker';

describe('<ColorPicker />', () => {
  const props = {
    name: 'colorCode',
    colorCode: '#0C976D',
    helperText: 'Tag color',
  };

  const wrapper = <ColorPicker {...props} />;

  it('renders <Calendar /> component', async () => {
    const { findByTestId } = render(wrapper);
    const container = await findByTestId('ColorPicker');
    expect(container).toHaveTextContent('Tag color');
  });

  it('test default color code', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('#0C976D');
  });

  it('test display picker panel', async () => {
    const { findByTestId } = render(wrapper);
    const container = await findByTestId('ChooseColor');
    fireEvent.click(container);
    expect(screen.findByRole('PickerPanel'));
  });

  it('test display TwitterPicker', async () => {
    const { findByTestId } = render(wrapper);
    const container = await findByTestId('ChooseColor');
    fireEvent.click(container);
  });
});
