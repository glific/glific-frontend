import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';

import chatIcon from 'assets/images/icons/Chat/Unselected.svg';
import broadcastIcon from 'assets/images/icons/Broadcast/Unselected.svg';
import flowIcon from 'assets/images/icons/Flow/Unselected.svg';
import searchIcon from 'assets/images/icons/Search/Unselected.svg';
import goalsIcon from 'assets/images/icons/Goals/Unselected.svg';
import analyticsIcon from 'assets/images/icons/Analytics/Unselected.svg';
import { ListIcon } from './ListIcon';

describe('list icon tests', () => {
  const iconList: { [iconName: string]: string } = {
    chat: chatIcon,
    broadcast: broadcastIcon,
    flow: flowIcon,
    search: searchIcon,
    goal: goalsIcon,
    analytics: analyticsIcon,
  };
  const createIcon = (type: string) => (
    <MemoryRouter>
      <ListIcon icon={type} />
    </MemoryRouter>
  );

  it('renders an object', () => {
    const { getByTestId } = render(createIcon('chat'));
    expect(getByTestId('listIcon')).toBeInTheDocument();
  });

  it('renders appropriate icons', () => {
    const keys = Object.keys(iconList);

    for (let i = 0; i < keys.length; i++) {
      const { container } = render(createIcon(keys[i]));
      expect(container.querySelector('img')?.src).toContain('Unselected.svg');
    }
  });
});
