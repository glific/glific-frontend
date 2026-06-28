import type { Meta, StoryObj } from '@storybook/react-vite';

// SideDrawer TSX icon components (color-prop icons used in nav)
import ChatIcon from '../../assets/images/icons/SideDrawer/ChatIcon';
import FlowIcon from '../../assets/images/icons/SideDrawer/FlowIcon';
import SearchIcon from '../../assets/images/icons/SideDrawer/SearchIcon';
import SpeedSendIcon from '../../assets/images/icons/SideDrawer/SpeedSendIcon';
import TemplateIcon from '../../assets/images/icons/SideDrawer/TemplateIcon';
import InteractiveIcon from '../../assets/images/icons/SideDrawer/InteractiveIcon';
import TriggerIcon from '../../assets/images/icons/SideDrawer/TriggerIcon';
import NotificationIcon from '../../assets/images/icons/SideDrawer/NotificationIcon';
import SheetsIcon from '../../assets/images/icons/SideDrawer/SheetsIcon';
import ContactVariableIcon from '../../assets/images/icons/SideDrawer/ContactVariableIcon';
import WebhookIcon from '../../assets/images/icons/SideDrawer/WebhookIcon';
import TicketIcon from '../../assets/images/icons/SideDrawer/TicketIcon';
import ManageIcon from '../../assets/images/icons/SideDrawer/ManageIcon';
import CollectionIcon from '../../assets/images/icons/SideDrawer/CollectionIcon';
import StaffIcon from '../../assets/images/icons/SideDrawer/StaffIcon';
import ContactIcon from '../../assets/images/icons/SideDrawer/ContactIcon';
import BlockIcon from '../../assets/images/icons/SideDrawer/BlockIcon';
import TagIcon from '../../assets/images/icons/SideDrawer/TagIcon';
import HelpIconNav from '../../assets/images/icons/SideDrawer/HelpIcon';
import ProfileIcon from '../../assets/images/icons/SideDrawer/ProfileIcon';
import AccountIcon from '../../assets/images/icons/SideDrawer/AccountIcon';
import SettingsIcon from '../../assets/images/icons/SideDrawer/SettingsIcon';
import LogoutIcon from '../../assets/images/icons/SideDrawer/LogoutIcon';
import OrganizationIcon from '../../assets/images/icons/SideDrawer/OrganizationIcon';
import ConsultingIcon from '../../assets/images/icons/SideDrawer/ConsultingIcon';
import Assistant from '../../assets/images/icons/SideDrawer/Assistant';
import AIEvalsIcon from '../../assets/images/icons/SideDrawer/AIEvalsIcon';
import WaGroupChat from '../../assets/images/icons/SideDrawer/WaGroupChat';
import WaGroupCollection from '../../assets/images/icons/SideDrawer/WaGroupCollection';
import WhatsAppGroupIcon from '../../assets/images/icons/SideDrawer/WhatsAppGroupIcon';
import WaPolls from '../../assets/images/icons/SideDrawer/WaPolls';
import CertificateIcon from '../../assets/images/icons/SideDrawer/CertificateIcon';
import WhatsappForm from '../../assets/images/icons/SideDrawer/WhatsappForm';

// Static SVG icons loaded as URLs via Vite glob
const svgUrls = import.meta.glob('../../assets/images/icons/**/*.svg', {
  query: '?url',
  eager: true,
}) as Record<string, { default: string }>;

function svgName(path: string) {
  return path.replace('../../assets/images/icons/', '').replace('.svg', '');
}

function groupSvgs(urls: Record<string, { default: string }>) {
  const groups: Record<string, Array<{ name: string; url: string }>> = {};
  for (const [path, mod] of Object.entries(urls)) {
    const name = svgName(path);
    const parts = name.split('/');
    const group = parts.length > 1 ? parts[0] : 'General';
    const label = parts[parts.length - 1];
    if (!groups[group]) groups[group] = [];
    groups[group].push({ name: label, url: mod.default });
  }
  return groups;
}

const sideDrawerIcons = [
  { name: 'Chat', Icon: ChatIcon },
  { name: 'Flow', Icon: FlowIcon },
  { name: 'Search', Icon: SearchIcon },
  { name: 'SpeedSend', Icon: SpeedSendIcon },
  { name: 'Template', Icon: TemplateIcon },
  { name: 'Interactive', Icon: InteractiveIcon },
  { name: 'Trigger', Icon: TriggerIcon },
  { name: 'Notification', Icon: NotificationIcon },
  { name: 'Sheets', Icon: SheetsIcon },
  { name: 'ContactVariable', Icon: ContactVariableIcon },
  { name: 'Webhook', Icon: WebhookIcon },
  { name: 'Ticket', Icon: TicketIcon },
  { name: 'Manage', Icon: ManageIcon },
  { name: 'Collection', Icon: CollectionIcon },
  { name: 'Staff', Icon: StaffIcon },
  { name: 'Contact', Icon: ContactIcon },
  { name: 'Block', Icon: BlockIcon },
  { name: 'Tag', Icon: TagIcon },
  { name: 'Help', Icon: HelpIconNav },
  { name: 'Profile', Icon: ProfileIcon },
  { name: 'Account', Icon: AccountIcon },
  { name: 'Settings', Icon: SettingsIcon },
  { name: 'Logout', Icon: LogoutIcon },
  { name: 'Organization', Icon: OrganizationIcon },
  { name: 'Consulting', Icon: ConsultingIcon },
  { name: 'Assistant', Icon: Assistant },
  { name: 'AI Evals', Icon: AIEvalsIcon },
  { name: 'WA Group Chat', Icon: WaGroupChat },
  { name: 'WA Group Collection', Icon: WaGroupCollection },
  { name: 'WA Group', Icon: WhatsAppGroupIcon },
  { name: 'WA Polls', Icon: WaPolls },
  { name: 'Certificate', Icon: CertificateIcon },
  { name: 'WA Form', Icon: WhatsappForm },
];

const iconCellStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  padding: '12px 8px',
  borderRadius: 8,
  background: '#fafafa',
  border: '1px solid #eee',
  minWidth: 80,
  cursor: 'default',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#666',
  textAlign: 'center',
  wordBreak: 'break-word',
  maxWidth: 80,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 40,
};

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
};

const meta: Meta = {
  title: 'Foundation/Icons',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SideDrawerIcons: Story = {
  name: 'Navigation Icons',
  render: () => (
    <div style={sectionStyle}>
      <p style={{ marginTop: 0, color: '#555', fontSize: 14 }}>
        TSX icon components from <code>src/assets/images/icons/SideDrawer/</code>. Accept a <code>color</code> prop.
      </p>
      <div style={gridStyle}>
        {sideDrawerIcons.map(({ name, Icon }) => (
          <div key={name} style={iconCellStyle}>
            <Icon color="#073f24" />
            <span style={labelStyle}>{name}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>Unselected (grey) state:</p>
        <div style={gridStyle}>
          {sideDrawerIcons.slice(0, 8).map(({ name, Icon }) => (
            <div key={name} style={{ ...iconCellStyle, background: '#f5f5f5' }}>
              <Icon color="#999999" />
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const AllSVGIcons: Story = {
  name: 'All SVG Icons',
  render: () => {
    const groups = groupSvgs(svgUrls);
    return (
      <div>
        <p style={{ color: '#555', fontSize: 14, marginTop: 0 }}>
          All <code>.svg</code> files from <code>src/assets/images/icons/</code>, grouped by folder.
        </p>
        {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([group, icons]) => (
          <div key={group} style={sectionStyle}>
            <h3 style={{ fontSize: 14, color: '#073F24', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              {group}
            </h3>
            <div style={gridStyle}>
              {icons.map(({ name, url }) => (
                <div key={name} style={iconCellStyle}>
                  <img src={url} alt={name} width={20} height={20} style={{ objectFit: 'contain' }} />
                  <span style={labelStyle}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
