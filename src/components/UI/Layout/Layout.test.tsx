import React from 'react';
import { render } from '@testing-library/react';

import { Layout } from './Layout';

describe('layout testing', () => {
  it('renders the appropriate components', () => {
    const { getByTestId } = render(<Layout>Default layout</Layout>);
    expect(getByTestId('navbar')).toBeInTheDocument();
    expect(getByTestId('layout')).toBeInTheDocument();
  });
});
