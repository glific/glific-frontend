import React, { lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Chat } from 'containers/Chat/Chat';
import { getUserRole } from 'context/role';
import { useToast } from 'services/ToastService';
import styles from './AuthenticatedRoute.module.css';

const defaultRedirect = () => <Redirect to="/chat" />;

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
  <Switch>
    <Route path="/chat" component={Chat} />

    <Route path="/collection" exact component={CollectionList} />
    <Route path="/collection/:id/contacts" exact component={CollectionContact} />
    <Route path="/user-profile" exact component={UserProfile} />
    <Route path="/contact-profile/:id" exact component={ContactProfile} />
    <Route path="/blocked-contacts" exact component={BlockContactList} />

    <Route path="/myaccount" exact component={MyAccount} />
    <Route path="/" render={defaultRedirect} />
  </Switch>
);

const routeAdmin = (
  <Switch>
    <Route path="/chat" component={Chat} />
    {/* <Route path="/tag" exact component={TagList} />
    <Route path="/tag/add" exact component={Tag} />
    <Route path="/tag/:id/edit" exact component={Tag} /> */}
    <Route path="/speed-send" exact component={SpeedSendList} />
    <Route path="/speed-send/add" exact component={SpeedSend} />
    <Route path="/speed-send/:id/edit" exact component={SpeedSend} />
    <Route path="/flow" exact component={FlowList} />
    <Route path="/flow/add" exact component={Flow} />
    <Route path="/flow/:id/edit" exact component={Flow} />
    <Route path="/collection" exact component={CollectionList} />
    <Route path="/collection/add" exact component={Collection} />
    <Route path="/collection/:id/edit" exact component={Collection} />
    <Route path="/collection/:id/contacts" exact component={CollectionContact} />

    <Route path="/flow/configure/:uuid" exact component={FlowEditor} />

    <Route path="/search" exact component={SearchList} />
    <Route path="/search/add" exact component={Search} />
    <Route path="/search/:id/edit" exact component={Search} />

    <Route path="/trigger/add" exact component={Trigger} />
    <Route path="/trigger/:id/edit" exact component={Trigger} />

    <Route path="/staff-management" exact component={StaffManagementList} />
    <Route path="/contact-management" exact component={ContactManagement} />
    <Route path="/staff-management/:id/edit" exact component={StaffManagement} />
    <Route path="/contact-profile/:id" exact component={ContactProfile} />
    <Route path="/user-profile" exact component={UserProfile} />
    <Route path="/myaccount" exact component={MyAccount} />
    <Route path="/template" exact component={HSMList} />
    <Route path="/template/add" exact component={HSM} />
    <Route path="/template/:id/edit" exact component={HSM} />
    <Route path="/settings" exact component={SettingList} />
    <Route path="/settings/organization" exact component={Organisation} />
    <Route path="/settings/billing" exact component={Billing} />
    <Route path="/settings/:type" exact component={Providers} />
    <Route path="/blocked-contacts" exact component={BlockContactList} />
    <Route path="/webhook-logs" exact component={WebhookLogsList} />
    <Route path="/notifications" exact component={NotificationList} />
    <Route path="/interactive-message" exact component={InteractiveMessageList} />
    <Route path="/interactive-message/add" exact component={InteractiveMessage} />
    <Route path="/interactive-message/:id/edit" exact component={InteractiveMessage} />
    <Route path="/trigger" exact component={TriggerList} />
    <Route path="/organizations" exact component={OrganizationList} />
    <Route path="/consulting-hours/" exact component={ConsultingHourList} />

    <Route path="/contact-fields/" exact component={ContactFieldList} />
    <Route
      path="/contact-fields/add"
      exact
      component={({ match }: any) => <ContactFieldList openDialog match={match} />}
    />
    <Route
      path="/organizations/:id/extensions"
      exact
      component={({ match }: any) => <OrganizationList openExtensionModal match={match} />}
    />
    <Route
      path="/organizations/:id/customer"
      exact
      component={({ match }: any) => <OrganizationList openCustomerModal match={match} />}
    />

    <Route path="/" render={defaultRedirect} />
  </Switch>
);

export const AuthenticatedRoute: React.SFC = () => {
  const toastMessage = useToast();

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
    <div className={styles.App} data-testid="app">
      {toastMessage}

      <Layout>{route}</Layout>
    </div>
  );
};

export default AuthenticatedRoute;
