import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { UnauthenticatedRoute } from './UnauthenticatedRoute';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

describe('<UnauthenticatedRoute />', () => {
  test('it should render', () => {
    const { container } = render(
      <Router>
        <UnauthenticatedRoute />
      </Router>
    );
    expect(container).toBeInTheDocument();
  });
});
