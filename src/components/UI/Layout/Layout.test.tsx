import React from 'react';
import { render } from '@testing-library/react';

import { Layout } from './Layout';
import { MemoryRouter } from 'react-router';

describe('layout testing', () => {
  it('renders the appropriate components', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Layout>Default layout</Layout>
      </MemoryRouter>
    );
    expect(getByTestId('navbar')).toBeInTheDocument();
    expect(getByTestId('layout')).toBeInTheDocument();
  });
});
