import ChatIcon from 'assets/images/icons/SideDrawer/ChatIcon';
import FlowIcon from 'assets/images/icons/SideDrawer/FlowIcon';
import SearchIcon from 'assets/images/icons/SideDrawer/SearchIcon';
import AnalyticsIcon from 'assets/images/icons/Analytics/Unselected.svg?react';
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
import OrganizationIcon from 'assets/images/icons/SideDrawer/OrganizationIcon';
import ConsultingIcon from 'assets/images/icons/SideDrawer/ConsultingIcon';
import WaChatIcon from 'assets/images/icons/SideDrawer/WaGroupChat';
import WaCollectionIcon from 'assets/images/icons/SideDrawer/WaGroupCollection';
import WaGroupIcon from 'assets/images/icons/SideDrawer/WhatsAppGroupIcon';
import Assistant from 'assets/images/icons/SideDrawer/Assistant';
import WaPolls from 'assets/images/icons/SideDrawer/WaPolls';
import styles from './ListIcon.module.css';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { Badge } from '@mui/material';
import DiscordIcon from 'assets/images/icons/Discord/DiscordIcon';
import CertificateIcon from 'assets/images/icons/SideDrawer/CertificateIcon';

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
    organization: OrganizationIcon,
    consulting: ConsultingIcon,
    new: FiberNewIcon,
    waGroupCollection: WaCollectionIcon,
    waGroupChat: WaChatIcon,
    waGroup: WaGroupIcon,
    assistant: Assistant,
    discord: DiscordIcon,
    waPolls: WaPolls,
    certificate: CertificateIcon,
  };

  const iconImage = stringsToIcons[icon] && (
    <RenderIcon component={stringsToIcons[icon]} color={selected ? '#073f24' : '#999999'} />
  );

  return (
    <span data-testid="listIcon" className={styles.ListIcon}>
      {count ? (
        <Badge badgeContent={count} color="warning" classes={{ badge: styles.Badge }}>
          {iconImage}
        </Badge>
      ) : (
        iconImage
      )}
    </span>
  );
};

export default ListIcon;
