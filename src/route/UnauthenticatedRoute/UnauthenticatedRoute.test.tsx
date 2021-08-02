import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { UnauthenticatedRoute } from './UnauthenticatedRoute';

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
