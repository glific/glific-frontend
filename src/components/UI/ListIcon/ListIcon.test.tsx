import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';

import ChatIcon from 'assets/images/icons/SideDrawer/ChatIcon';
import FlowIcon from 'assets/images/icons/SideDrawer/FlowIcon';
import SearchIcon from 'assets/images/icons/SideDrawer/SearchIcon';
import SpeedSendIcon from 'assets/images/icons/SideDrawer/SpeedSendIcon';
import TemplateIcon from 'assets/images/icons/SideDrawer/TemplateIcon';
import { ListIcon } from './ListIcon';

describe('list icon tests', () => {
  const iconList: { [iconName: string]: (color: { color: any }) => JSX.Element } = {
    chat: ChatIcon,
    flow: FlowIcon,
    search: SearchIcon,
    'speed-send': SpeedSendIcon,
    template: TemplateIcon,
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
});
