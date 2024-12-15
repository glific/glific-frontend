import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';

import { ListIcon } from './ListIcon';

describe('list icon tests', () => {
  const createIcon = (type: string) => (
    <MemoryRouter>
      <ListIcon icon={type} />
    </MemoryRouter>
  );

  it('renders an object', () => {
    const { getByTestId } = render(createIcon('chat'));
    expect(getByTestId('listIcon')).toBeInTheDocument();
  });
});
