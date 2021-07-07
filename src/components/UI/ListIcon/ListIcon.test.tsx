import { ListIcon } from './ListIcon';
import { render } from '@testing-library/react';

import chatIcon from '../../../assets/images/icons/Chat/Unselected.svg';
import tagIcon from '../../../assets/images/icons/Tags/Unselected.svg';
import broadcastIcon from '../../../assets/images/icons/Broadcast/Unselected.svg';
import flowIcon from '../../../assets/images/icons/Flow/Unselected.svg';
import searchIcon from '../../../assets/images/icons/Search/Unselected.svg';
import goalsIcon from '../../../assets/images/icons/Goals/Unselected.svg';
import analyticsIcon from '../../../assets/images/icons/Analytics/Unselected.svg';
import { MemoryRouter } from 'react-router';

describe('list icon tests', () => {
  const iconList: { [iconName: string]: string } = {
    chat: chatIcon,
    tag: tagIcon,
    broadcast: broadcastIcon,
    flow: flowIcon,
    search: searchIcon,
    goal: goalsIcon,
    analytics: analyticsIcon,
  };
  const createIcon = (type: string, selected: boolean) => {
    return (
      <MemoryRouter>
        <ListIcon icon={type} />
      </MemoryRouter>
    );
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  it('renders an object', () => {
    const { getByTestId } = render(createIcon('chat', false));
    expect(getByTestId('listIcon')).toBeInTheDocument();
  });

  it('renders appropriate icons', () => {
    const keys = Object.keys(iconList);

    for (let i = 0; i < keys.length; i++) {
      const { container } = render(createIcon(keys[i], false));
      expect(container.querySelector('img')?.src).toContain('Unselected.svg');
    }
  });
});
