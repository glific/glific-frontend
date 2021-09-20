import { render, screen } from '@testing-library/react';

import { Timer } from './Timer';

const timer = (time: Date) => <Timer time={time} />;

test('it should render timer component', async () => {
  render(timer(new Date()));
  expect(screen.getByTestId('timerCount')).toBeInTheDocument();
});

test('it should display the remaining time', async () => {
  // get current date time
  const date = new Date();

  // subtract 2 hours
  date.setHours(date.getHours() - 2);

  // render timer
  render(timer(date));

  const timerElement = screen.getByTestId('timerCount');
  expect(timerElement).toHaveTextContent('22');
});

test('it should render component and session window is about to expire ', async () => {
  // get current date time
  const date = new Date();

  // subtract 22 hours
  date.setHours(date.getHours() - 22);

  // render timer
  render(timer(date));

  const timerElement = screen.getByTestId('timerCount');
  expect(timerElement).toHaveTextContent('02');
});

test('it should render component and session window is expired ', async () => {
  // get current date time
  const date = new Date();

  // subtract 30 hours
  date.setHours(date.getHours() - 30);

  // render timer
  render(timer(date));

  const timerElement = screen.getByTestId('timerCount');
  expect(timerElement).toHaveTextContent('0');
});

test('it should render for contact status invalid', () => {
  render(<Timer time={new Date()} contactStatus="INVALID" />);
});
