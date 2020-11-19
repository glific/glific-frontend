import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';

const props = {
  name: 'colorCode',
  colorCode: '#0C976D',
  helperText: 'Tag color',
  form: { setFieldValue: Function },
};

const wrapper = <ColorPicker {...props} />;

describe('<ColorPicker />', () => {
  it('renders <ColorPicker /> component', async () => {
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

describe('Test choose color', () => {
  it('chose color', async () => {
    const { findByTestId } = render(wrapper);
    const container = await findByTestId('ChooseColor');
    fireEvent.click(container);
    const color = await screen.findByDisplayValue('22194D');
    fireEvent.change(color, { target: { value: '9900EF' } });
  });
});
