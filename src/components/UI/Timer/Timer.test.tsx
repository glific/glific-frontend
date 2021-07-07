import { render, screen } from '@testing-library/react';

import { Timer } from './Timer';

const timer = (time: Date) => <Timer time={time} />;

test('it should render timer component', () => {
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
