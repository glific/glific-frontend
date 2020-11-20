import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import SideMenus from './SideMenus';
import { getCurrentUserQuery } from '../../../../../mocks/User';

const mocks = [getCurrentUserQuery];
describe('side menu testing', () => {
  const component = (
    <MemoryRouter>
      <SideMenus opened={false} />
    </MemoryRouter>
  );

  it('it should be initialized properly', async () => {
    const { getByTestId } = render(component);
    expect(getByTestId('list')).toBeInTheDocument();
  });
});
