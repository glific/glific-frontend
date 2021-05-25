import { fireEvent, render, screen } from '@testing-library/react';
import { TemplateButtons } from './TemplateButtons';

const props: any = {
  template: [
    {
      title: 'Click here',
      value: 'www.google.com',
      tooltip: 'Currently not supported',
      type: 'call-to-action',
    },
    {
      title: 'Contact us',
      value: null,
      tooltip: 'Currently not supported',
      type: 'call-to-action',
    },
  ],
};
window.open = jest.fn();

test('renders components successfully with call-to-action buttons', () => {
  render(<TemplateButtons {...props} />);
  expect(screen.getByText(/Contact us/i)).toBeInTheDocument();
  expect(screen.getByText(/Click here/i)).toBeInTheDocument();
});

test('renders components successfully with callback event', () => {
  render(<TemplateButtons {...props} />);
  const button = screen.getByText(/Click here/i);
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(window.open).toHaveBeenCalledTimes(1);
  expect(window.open).toHaveBeenCalledWith('www.google.com', '_blank');
});

test('renders components with quick reply buttons', () => {
  props.template = [
    {
      title: 'Yes',
      value: 'Yes',
      tooltip: null,
      type: 'quick-reply',
    },
  ];
  props.callbackTemplateButtonClick = jest.fn();

  render(<TemplateButtons {...props} />);
  const button = screen.getByText('Yes');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);

  expect(props.callbackTemplateButtonClick).toHaveBeenCalledTimes(1);
});
