import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ErrorBoundary from 'components/errorboundary/ErrorBoundary';
import { ChatInterface } from 'containers/Chat/ChatInterface/ChatInterface';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { checkDynamicRole, getUserRole } from 'context/role';
import { useToast } from 'services/ToastService';
import { ProviderContext } from 'context/session';
import { GET_ORGANIZATION_PROVIDER } from 'graphql/queries/Organization';
import styles from './AuthenticatedRoute.module.css';

const Chat = lazy(() => import('containers/Chat/Chat'));
const Layout = lazy(() => import('components/UI/Layout/Layout'));
const SpeedSendList = lazy(() => import('containers/Template/List/SpeedSendList/SpeedSendList'));
const SpeedSend = lazy(() => import('containers/Template/Form/SpeedSend/SpeedSend'));
const FlowList = lazy(() => import('containers/Flow/FlowList/FlowList'));
const Flow = lazy(() => import('containers/Flow/Flow'));
const SheetIntegrationList = lazy(
  () => import('containers/SheetIntegration/SheetIntegrationList/SheetIntegrationList')
);
const SheetIntegration = lazy(() => import('containers/SheetIntegration/SheetIntegration'));
const CollectionList = lazy(() => import('containers/Collection/CollectionList/CollectionList'));
const Collection = lazy(() => import('containers/Collection/Collection'));
const CollectionContact = lazy(
  () => import('containers/Collection/CollectionContact/CollectionContact')
);
const FlowEditor = lazy(() => import('components/floweditor/FlowEditor'));
const SearchList = lazy(() => import('containers/Search/SearchList/SearchList'));
const Search = lazy(() => import('containers/Search/Search'));
const StaffManagementList = lazy(
  () => import('containers/StaffManagement/StaffManagementList/StaffManagementList')
);
const ContactManagement = lazy(() => import('containers/ContactManagement/ContactManagement'));
const StaffManagement = lazy(() => import('containers/StaffManagement/StaffManagement'));
const ContactProfile = lazy(() => import('containers/Profile/Contact/ContactProfile'));
const UserProfile = lazy(() => import('containers/Profile/User/UserProfile'));
const MyAccount = lazy(() => import('containers/MyAccount/MyAccount'));
const HSMList = lazy(() => import('containers/Template/List/HSMList/HSMList'));
const HSM = lazy(() => import('containers/Template/Form/HSM/HSM'));

const TicketList = lazy(() => import('containers/Ticket/TicketList/TicketList'));
const SettingList = lazy(() => import('containers/SettingList/SettingList'));
const Billing = lazy(() => import('containers/SettingList/Billing/Billing'));

const Providers = lazy(() => import('containers/SettingList/Providers/Providers'));
const BlockContactList = lazy(
  () => import('containers/BlockContact/BlockContactList/BlockContactList')
);
const Organization = lazy(() => import('containers/SettingList/Organization/Organization'));
const OrganizationFlows = lazy(
  () => import('containers/SettingList/OrganizationFlows/OrganizationFlows')
);
const WebhookLogsList = lazy(
  () => import('containers/WebhookLogs/WebhookLogsList/WebhookLogsList')
);
const TriggerList = lazy(() => import('containers/Trigger/TriggerList/TriggerList'));
const Trigger = lazy(() => import('containers/Trigger/Trigger'));
const NotificationList = lazy(() => import('containers/NotificationList/NotificationList'));
const OrganizationList = lazy(() => import('containers/OrganizationList/OrganizationList'));
const ConsultingHourList = lazy(
  () => import('containers/Consulting/ConsultingList/ConsultingList')
);
const ContactFieldList = lazy(
  () => import('containers/ContactField/ContactFieldList/ContactFieldList')
);
const InteractiveMessageList = lazy(
  () => import('containers/InteractiveMessage/InteractiveMessageList/InteractiveMessageList')
);
const InteractiveMessage = lazy(() => import('containers/InteractiveMessage/InteractiveMessage'));

const RoleList = lazy(() => import('containers/Role/RoleList/RoleList'));
const Role = lazy(() => import('containers/Role/Role'));

const routeStaff = (
  <Routes>
    <Route path="collection" element={<CollectionList />} />
    <Route path="collection/:id/contacts" element={<CollectionContact />} />
    <Route path="user-profile" element={<UserProfile />} />
    <Route path="ticket" element={<TicketList />} />
    <Route path="contact-profile/:id" element={<ContactProfile />} />
    <Route path="blocked-contacts" element={<BlockContactList />} />
    <Route path="myaccount" element={<MyAccount />} />
    <Route path="/*" element={<Chat />} />
  </Routes>
);

const routeAdmin = (
  <Routes>
    <Route path="speed-send" element={<SpeedSendList />} />
    <Route path="speed-send/add" element={<SpeedSend />} />
    <Route path="speed-send/:id/edit" element={<SpeedSend />} />
    <Route path="flow" element={<FlowList />} />
    <Route path="flow/add" element={<Flow />} />
    <Route path="flow/:id/edit" element={<Flow />} />
    <Route path="role" element={<RoleList />} />
    <Route path="role/add" element={<Role />} />
    <Route path="role/:id/edit" element={<Role />} />
    <Route path="collection" element={<CollectionList />} />
    <Route path="collection/add" element={<Collection />} />
    <Route path="collection/:id/edit" element={<Collection />} />
    <Route path="collection/:id/contacts" element={<CollectionContact />} />
    <Route path="sheet-integration" element={<SheetIntegrationList />} />
    <Route path="sheet-integration/add" element={<SheetIntegration />} />
    <Route path="sheet-integration/:id/edit" element={<SheetIntegration />} />

    <Route path="flow/configure/:uuid" element={<FlowEditor />} />

    <Route path="search" element={<SearchList />} />
    <Route path="search/add" element={<Search />} />
    <Route path="search/:id/edit" element={<Search />} />

    <Route path="trigger/add" element={<Trigger />} />
    <Route path="trigger/:id/edit" element={<Trigger />} />

    <Route path="staff-management" element={<StaffManagementList />} />
    <Route path="contact-management" element={<ContactManagement />} />
    <Route path="staff-management/:id/edit" element={<StaffManagement />} />
    <Route path="contact-profile/:id" element={<ContactProfile />} />
    <Route path="user-profile" element={<UserProfile />} />
    <Route path="myaccount" element={<MyAccount />} />
    <Route path="template" element={<HSMList />} />
    <Route path="template/add" element={<HSM />} />
    <Route path="template/:id/edit" element={<HSM />} />
    <Route path="ticket" element={<TicketList />} />
    <Route path="settings" element={<SettingList />} />
    <Route path="settings/organization" element={<Organization />} />
    <Route path="settings/organization-flows" element={<OrganizationFlows />} />
    <Route path="settings/billing" element={<Billing />} />
    <Route path="settings/:type" element={<Providers />} />
    <Route path="blocked-contacts" element={<BlockContactList />} />
    <Route path="webhook-logs" element={<WebhookLogsList />} />
    <Route path="notifications" element={<NotificationList />} />
    <Route path="interactive-message" element={<InteractiveMessageList />} />
    <Route path="interactive-message/add" element={<InteractiveMessage />} />
    <Route path="interactive-message/:id/edit" element={<InteractiveMessage />} />
    <Route path="trigger" element={<TriggerList />} />
    <Route path="organizations" element={<OrganizationList />} />
    <Route path="consulting-hours/" element={<ConsultingHourList />} />

    <Route path="contact-fields/" element={<ContactFieldList />} />
    <Route path="organizations/:id/extensions" element={<OrganizationList openExtensionModal />} />
    <Route path="organizations/:id/customer" element={<OrganizationList openCustomerModal />} />

    <Route path="/*" element={<Chat />} />
  </Routes>
);

export const chatRoutes = (
  <Routes>
    <Route path="chat" element={<ChatInterface />} />
    <Route path="chat/collection" element={<ChatInterface collectionType />} />
    <Route path="chat/saved-searches" element={<ChatInterface savedSearches />} />
    <Route path="chat/saved-searches/:contactId" element={<ChatInterface savedSearches />} />
    <Route path="chat/:contactId" element={<ChatInterface />} />
    <Route path="chat/collection/:collectionId" element={<ChatInterface />} />
    <Route path="/*" element={<ChatInterface />} />
  </Routes>
);

export const AuthenticatedRoute = () => {
  const toastMessage = useToast();

  const { data: organizationProvider } = useQuery(GET_ORGANIZATION_PROVIDER);

  const [provider, setProvider] = useState<string>('');

  useEffect(() => {
    if (organizationProvider) {
      setProvider(organizationProvider.organization.organization.bsp.shortcode);
    }
  }, [organizationProvider]);

  const values = useMemo(
    () => ({
      provider,
      setProvider: (value: any) => {
        setProvider(value);
      },
    }),
    [provider]
  );

  let userRole: any[] = [];
  let route;

  if (getUserRole()) {
    userRole = getUserRole();
  }

  if (userRole.includes('Staff')) {
    route = routeStaff;
  }

  if (
    checkDynamicRole() ||
    userRole.includes('Manager') ||
    userRole.includes('Admin') ||
    userRole.includes('Glific_admin')
  ) {
    route = routeAdmin;
  }

  // let's call chat subscriptions at this level so that we can listen to actions which are not performed
  // on chat screen, for eg: send message to collection
  return (
    <ProviderContext.Provider value={values}>
      <div className={styles.App} data-testid="app">
        <Layout>
          {toastMessage}
          <Suspense
            fallback={<Loading showTip={window.location.pathname.startsWith('/flow/configure')} />}
          >
            <ErrorBoundary>{route}</ErrorBoundary>
          </Suspense>
        </Layout>
      </div>
    </ProviderContext.Provider>
  );
};

export default AuthenticatedRoute;
