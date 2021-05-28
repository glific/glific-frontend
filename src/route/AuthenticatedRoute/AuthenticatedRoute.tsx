import React, { lazy, useState } from 'react';
import { Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';

import styles from './AuthenticatedRoute.module.css';
import { Layout } from '../../components/UI/Layout/Layout';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { getUserRole } from '../../context/role';
import { useToast } from '../../services/ToastService';
import { Chat } from '../../containers/Chat/Chat';
import { ChatSubscription } from '../../containers/Chat/ChatSubscription/ChatSubscription';
import Extensions from '../../containers/Extensions/Extensions';

const defaultRedirect = () => <Redirect to="/chat" />;

const TagList = lazy(() => import('../../containers/Tag/TagList/TagList'));
const Tag = lazy(() => import('../../containers/Tag/Tag'));
const SpeedSendList = lazy(
  () => import('../../containers/Template/List/SpeedSendList/SpeedSendList')
);
const SpeedSend = lazy(() => import('../../containers/Template/Form/SpeedSend/SpeedSend'));
const FlowList = lazy(() => import('../../containers/Flow/FlowList/FlowList'));
const Flow = lazy(() => import('../../containers/Flow/Flow'));
const CollectionList = lazy(
  () => import('../../containers/Collection/CollectionList/CollectionList')
);
const Collection = lazy(() => import('../../containers/Collection/Collection'));
const CollectionContact = lazy(
  () => import('../../containers/Collection/CollectionContact/CollectionContact')
);
const FlowEditor = lazy(() => import('../../components/floweditor/FlowEditor'));
const SearchList = lazy(() => import('../../containers/Search/SearchList/SearchList'));
const Search = lazy(() => import('../../containers/Search/Search'));
const StaffManagementList = lazy(
  () => import('../../containers/StaffManagement/StaffManagementList/StaffManagementList')
);
const StaffManagement = lazy(() => import('../../containers/StaffManagement/StaffManagement'));
const ContactProfile = lazy(() => import('../../containers/Profile/Contact/ContactProfile'));
const UserProfile = lazy(() => import('../../containers/Profile/User/UserProfile'));
const MyAccount = lazy(() => import('../../containers/MyAccount/MyAccount'));
const HSMList = lazy(() => import('../../containers/Template/List/HSMList/HSMList'));
const HSM = lazy(() => import('../../containers/Template/Form/HSM/HSM'));

const SettingList = lazy(() => import('../../containers/SettingList/SettingList'));
const Billing = lazy(() => import('../../containers/SettingList/Billing/Billing'));

const Providers = lazy(() => import('../../containers/SettingList/Providers/Providers'));
const BlockContactList = lazy(
  () => import('../../containers/BlockContact/BlockContactList/BlockContactList')
);
const Organisation = lazy(() => import('../../containers/SettingList/Organisation/Organisation'));
const WebhookLogsList = lazy(
  () => import('../../containers/WebhookLogs/WebhookLogsList/WebhookLogsList')
);
const TriggerList = lazy(() => import('../../containers/Trigger/TriggerList/TriggerList'));
const Trigger = lazy(() => import('../../containers/Trigger/Trigger'));
const NotificationList = lazy(() => import('../../containers/NotificationList/NotificationList'));
const OrganizationList = lazy(() => import('../../containers/OrganizationList/OrganizationList'));
const ConsultingHourList = lazy(
  () => import('../../containers/Consulting/ConsultingList/ConsultingList')
);
const ContactFieldList = lazy(
  () => import('../../containers/ContactField/ContactFieldList/ContactFieldList')
);

const routeStaff = (
  <Switch>
    <Route path="/chat" exact component={Chat} />
    <Route exact path="/chat/collection" component={() => <Chat collectionId={-1} />} />
    <Route exact path="/chat/saved-searches/" component={() => <Chat savedSearches />} />
    <Route
      exact
      path="/chat/saved-searches/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <Chat savedSearches contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <Chat contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/collection/:collectionId"
      component={({ match }: RouteComponentProps<{ collectionId: any }>) => (
        <Chat collectionId={match.params.collectionId} />
      )}
    />

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
    <Route path="/chat" exact component={Chat} />
    <Route path="/tag" exact component={TagList} />
    <Route path="/tag/add" exact component={Tag} />
    <Route path="/tag/:id/edit" exact component={Tag} />
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
    <Route exact path="/chat/collection" component={() => <Chat collectionId={-1} />} />
    <Route exact path="/chat/saved-searches/" component={() => <Chat savedSearches />} />
    <Route
      exact
      path="/chat/saved-searches/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <Chat savedSearches contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <Chat contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/collection/:collectionId"
      component={({ match }: RouteComponentProps<{ collectionId: any }>) => (
        <Chat collectionId={match.params.collectionId} />
      )}
    />
    <Route path="/trigger" exact component={TriggerList} />
    <Route path="/organizations" exact component={OrganizationList} />
    <Route path="/consulting-hours/" exact component={ConsultingHourList} />
    <Route
      path="/consulting-hours/add"
      exact
      component={({ match }: any) => <ConsultingHourList openDialog match={match} />}
    />
    <Route
      path="/consulting-hours/:id/edit"
      exact
      component={({ match }: any) => <ConsultingHourList openDialog match={match} />}
    />
    <Route path="/contact-fields/" exact component={ContactFieldList} />
    <Route
      path="/contact-fields/add"
      exact
      component={({ match }: any) => <ContactFieldList openDialog match={match} />}
    />
    <Route
      path="/organizations/:id/extensions"
      exact
      component={({ match }: any) => <Extensions openDialog match={match} />}
    />

    <Route path="/" render={defaultRedirect} />
  </Switch>
);

export const AuthenticatedRoute: React.SFC = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const loadingSpinner = <Loading />;
  route = dataLoaded ? route : null;
  // let's call chat subscriptions at this level so that we can listen to actions which are not performed
  // on chat screen, for eg: send message to collection
  return (
    <div className={styles.App} data-testid="app">
      {toastMessage}
      {userRole.length > 0 ? (
        <ChatSubscription setDataLoaded={setDataLoaded} setLoading={setLoading} />
      ) : (
        ''
      )}
      <Layout>{loading ? loadingSpinner : route}</Layout>
    </div>
  );
};

export default AuthenticatedRoute;
