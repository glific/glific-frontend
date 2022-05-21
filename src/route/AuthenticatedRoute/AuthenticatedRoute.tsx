import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { Routes, Route, Navigate, RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { Chat } from 'containers/Chat/Chat';
import ChatInterface from 'containers/Chat/ChatInterface/ChatInterface';
import Loading from 'components/UI/Layout/Loading/Loading';
import { getUserRole } from 'context/role';
import { useToast } from 'services/ToastService';
import { ProviderContext } from 'context/session';
import { GET_ORGANIZATION_PROVIDER } from 'graphql/queries/Organization';
import styles from './AuthenticatedRoute.module.css';

const defaultRedirect = () => <Navigate to="/chat" />;

// const TagList = lazy(() => import('containers/Tag/TagList/TagList'));
// const Tag = lazy(() => import('containers/Tag/Tag'));
const Layout = lazy(() => import('components/UI/Layout/Layout'));
const SpeedSendList = lazy(() => import('containers/Template/List/SpeedSendList/SpeedSendList'));
const SpeedSend = lazy(() => import('containers/Template/Form/SpeedSend/SpeedSend'));
const FlowList = lazy(() => import('containers/Flow/FlowList/FlowList'));
const Flow = lazy(() => import('containers/Flow/Flow'));
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

const SettingList = lazy(() => import('containers/SettingList/SettingList'));
const Billing = lazy(() => import('containers/SettingList/Billing/Billing'));

const Providers = lazy(() => import('containers/SettingList/Providers/Providers'));
const BlockContactList = lazy(
  () => import('containers/BlockContact/BlockContactList/BlockContactList')
);
const Organisation = lazy(() => import('containers/SettingList/Organisation/Organisation'));
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

const routeStaff = (
  <Routes>
    <Route path="/chat" element={<Chat />} />

    <Route path="/collection" element={<CollectionList />} />
    <Route path="/collection/:id/contacts" element={<CollectionContact />} />
    <Route path="/user-profile" element={<UserProfile />} />
    <Route path="/contact-profile/:id" element={<ContactProfile />} />
    <Route path="/blocked-contacts" element={<BlockContactList />} />

    <Route path="/myaccount" element={<MyAccount />} />
    <Route path="/" render={defaultRedirect} />
  </Routes>
);

const routeAdmin = (
  <Routes>
    <Route path="/chat" element={<Chat />} />
    {/* <Route path="/tag" element={TagList} />
    <Route path="/tag/add" element={Tag} />
    <Route path="/tag/:id/edit" element={Tag} /> */}
    <Route path="/speed-send" element={<SpeedSendList />} />
    <Route path="/speed-send/add" element={<SpeedSend />} />
    <Route path="/speed-send/:id/edit" element={<SpeedSend />} />
    <Route path="/flow" element={<FlowList />} />
    <Route path="/flow/add" element={<Flow />} />
    <Route path="/flow/:id/edit" element={<Flow />} />
    <Route path="/collection" element={<CollectionList />} />
    <Route path="/collection/add" element={<Collection />} />
    <Route path="/collection/:id/edit" element={<Collection />} />
    <Route path="/collection/:id/contacts" element={<CollectionContact />} />

    <Route path="/flow/configure/:uuid" element={<FlowEditor />} />

    <Route path="/search" element={<SearchList />} />
    <Route path="/search/add" element={<Search />} />
    <Route path="/search/:id/edit" element={<Search />} />

    <Route path="/trigger/add" element={<Trigger />} />
    <Route path="/trigger/:id/edit" element={<Trigger />} />

    <Route path="/staff-management" element={<StaffManagementList />} />
    <Route path="/contact-management" element={<ContactManagement />} />
    <Route path="/staff-management/:id/edit" element={<StaffManagement />} />
    <Route path="/contact-profile/:id" element={<ContactProfile />} />
    <Route path="/user-profile" element={<UserProfile />} />
    <Route path="/myaccount" element={<MyAccount />} />
    <Route path="/template" element={<HSMList />} />
    <Route path="/template/add" element={<HSM />} />
    <Route path="/template/:id/edit" element={<HSM />} />
    <Route path="/settings" element={<SettingList />} />
    <Route path="/settings/organization" element={<Organisation />} />
    <Route path="/settings/billing" element={<Billing />} />
    <Route path="/settings/:type" element={<Providers />} />
    <Route path="/blocked-contacts" element={<BlockContactList />} />
    <Route path="/webhook-logs" element={<WebhookLogsList />} />
    <Route path="/notifications" element={<NotificationList />} />
    <Route path="/interactive-message" element={<InteractiveMessageList />} />
    <Route path="/interactive-message/add" element={<InteractiveMessage />} />
    <Route path="/interactive-message/:id/edit" element={<InteractiveMessage />} />
    <Route path="/trigger" element={<TriggerList />} />
    <Route path="/organizations" element={<OrganizationList />} />
    <Route path="/consulting-hours/" element={<ConsultingHourList />} />

    <Route path="/contact-fields/" element={<ContactFieldList />} />
    <Route path="/contact-fields/add" element={<ContactFieldList openDialog />} />
    <Route path="/organizations/:id/extensions" element={<OrganizationList openExtensionModal />} />
    <Route path="/organizations/:id/customer" element={<OrganizationList openCustomerModal />} />

    <Route path="/" render={defaultRedirect} />
  </Routes>
);

export const chatRoutes = (
  <Routes>
    <Route path="/chat/collection" element={<ChatInterface collectionId={-1} />} />
    <Route path="/chat/saved-searches/" element={<ChatInterface savedSearches />} />
    <Route path="/chat/saved-searches/:contactId" element={<ChatInterface savedSearches />} />
    <Route path="/chat/:contactId" element={<ChatInterface />} />
    <Route path="/chat/collection/:collectionId" element={<ChatInterface />} />
    <Route path="/chat" element={<ChatInterface />} />
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
          <Suspense fallback={<Loading />}>{route}</Suspense>
        </Layout>
      </div>
    </ProviderContext.Provider>
  );
};

export default AuthenticatedRoute;
