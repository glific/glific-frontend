import React from 'react';
import { render, screen, wait } from '@testing-library/react';

import { Timer } from './Timer';

const timer = (time: Date) => <Timer time={time}></Timer>;

test('it should render timer component', () => {
  render(timer(new Date()));
  expect(screen.getByTestId('timerCount')).toBeInTheDocument();
});

test('it should display the remaining time', async () => {
  const date = new Date();
  date.setHours(date.getHours() - 2);

  const { findByTestId } = render(timer(date));

  await wait();
  const timerElement = await findByTestId('timerCount');
  screen.debug();
  expect(timerElement).toHaveTextContent('22');
});
