import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('check if rendering the home page correctly', () => {
  const { getByText } = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const projectTitle = getByText(/Glific/i);
  expect(projectTitle).toBeInTheDocument();

  const welcomeMessage = getByText(/Welcome to Dashboard!/i);
  expect(welcomeMessage).toBeInTheDocument();
});
