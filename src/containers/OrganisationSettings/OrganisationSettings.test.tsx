import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OrganisationSettings from './OrganisationSettings';

describe('<OrganisationSettings />', () => {
  test('it should mount', () => {
    render(<OrganisationSettings />);
    
    const organisationSettings = screen.getByTestId('OrganisationSettings');

    expect(organisationSettings).toBeInTheDocument();
  });
});