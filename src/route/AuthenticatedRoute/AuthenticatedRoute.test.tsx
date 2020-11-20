import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import AuthenticatedRoute from './AuthenticatedRoute';
import { render,waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

describe('<AuthenticatedRoute />', () => {
  test('it should render',async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <BrowserRouter>
          <AuthenticatedRoute />
        </BrowserRouter>
      </MockedProvider>
    );
    await waitFor(()=>{
      expect(getByTestId('app')).toBeInTheDocument();
    })
    
  });
});
