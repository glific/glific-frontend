import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';
import userEvent from '@testing-library/user-event';

const serFieldValueMock = vi.fn();

const props = {
  name: 'colorCode',
  colorCode: '#0C976D',
  helperText: 'Tag color',
  form: { setFieldValue: serFieldValueMock },
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
  it('choose color', async () => {
    const user = userEvent.setup();
    const { findByTestId } = render(wrapper);

    const container = await findByTestId('ChooseColor');
    user.click(container);

    const color = await screen.findByDisplayValue('22194D');
    await user.click(color);
    await userEvent.keyboard('{backspace}{backspace}EF');
    expect(color).toHaveValue('2219EF');
  });
});
