import ChatIcon from 'assets/images/icons/SideDrawer/ChatIcon';
import FlowIcon from 'assets/images/icons/SideDrawer/FlowIcon';
import SearchIcon from 'assets/images/icons/SideDrawer/SearchIcon';
import { ReactComponent as AnalyticsIcon } from 'assets/images/icons/Analytics/Unselected.svg';
import SpeedSendIcon from 'assets/images/icons/SideDrawer/SpeedSendIcon';
import TemplateIcon from 'assets/images/icons/SideDrawer/TemplateIcon';
import InteractiveMessageIcon from 'assets/images/icons/SideDrawer/InteractiveIcon';
import TriggerIcon from 'assets/images/icons/SideDrawer/TriggerIcon';
import NotificationIcon from 'assets/images/icons/SideDrawer/NotificationIcon';
import SheetsIcon from 'assets/images/icons/SideDrawer/SheetsIcon';
import ContactVariableIcon from 'assets/images/icons/SideDrawer/ContactVariableIcon';
import WebhookLogsIcon from 'assets/images/icons/SideDrawer/WebhookIcon';
import SupportAgentIcon from 'assets/images/icons/SideDrawer/TicketIcon';
import ManageIcon from 'assets/images/icons/SideDrawer/ManageIcon';
import CollectionIcon from 'assets/images/icons/SideDrawer/CollectionIcon';
import StaffManagementIcon from 'assets/images/icons/SideDrawer/StaffIcon';
import ContactIcon from 'assets/images/icons/SideDrawer/ContactIcon';
import BlockIcon from 'assets/images/icons/SideDrawer/BlockIcon';
import TagIcon from 'assets/images/icons/SideDrawer/TagIcon';
import HelpIcon from 'assets/images/icons/SideDrawer/HelpIcon';
import ProfileIcon from 'assets/images/icons/SideDrawer/ProfileIcon';
import AcoountIcon from 'assets/images/icons/SideDrawer/AccountIcon';
import SettingsIcon from 'assets/images/icons/SideDrawer/SettingsIcon';
import LogoutIcon from 'assets/images/icons/SideDrawer/LogoutIcon';

export interface ListIconProps {
  icon: string | undefined;
  count?: number;
  selected?: boolean;
}

const RenderIcon = ({ component: Component, color }: any) => <Component color={color} />;

export const ListIcon = ({ icon = '', selected = false, count }: ListIconProps) => {
  const stringsToIcons: { [iconName: string]: any } = {
    chat: ChatIcon,
    flow: FlowIcon,
    search: SearchIcon,
    analytics: AnalyticsIcon,
    'speed-send': SpeedSendIcon,
    template: TemplateIcon,
    trigger: TriggerIcon,
    notification: NotificationIcon,
    'interactive-message': InteractiveMessageIcon,
    help: HelpIcon,
    sheets: SheetsIcon,
    tickets: SupportAgentIcon,
    webhook: WebhookLogsIcon,
    fields: ContactVariableIcon,
    manage: ManageIcon,
    collection: CollectionIcon,
    staff: StaffManagementIcon,
    contact: ContactIcon,
    block: BlockIcon,
    tag: TagIcon,
    profile: ProfileIcon,
    account: AcoountIcon,
    settings: SettingsIcon,
    logout: LogoutIcon,
  };

  return (
    <span data-testid="listIcon">
      {stringsToIcons[icon] && (
        <RenderIcon component={stringsToIcons[icon]} color={selected ? '#073f24' : '#999999'} />
      )}
    </span>
  );
};

export default ListIcon;
