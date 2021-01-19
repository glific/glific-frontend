import React, { useState } from 'react';
import { Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';

import styles from './AuthenticatedRoute.module.css';
import { TagPage } from '../../components/pages/TagPage/TagPage';
import { Tag } from '../../containers/Tag/Tag';
import { SpeedSendPage } from '../../components/pages/Template/SpeedSendPage/SpeedSendPage';
import { SpeedSend } from '../../containers/Template/Form/SpeedSend/SpeedSend';
import { FlowList } from '../../containers/Flow/FlowList/FlowList';
import { Flow } from '../../containers/Flow/Flow';
import { GroupList } from '../../containers/Group/GroupList/GroupList';
import { Group } from '../../containers/Group/Group';
import { GroupContact } from '../../containers/Group/GroupContact/GroupContact';
import { FlowEditor } from '../../components/floweditor/FlowEditor';
import { SearchList } from '../../containers/Search/SearchList/SearchList';
import { Search } from '../../containers/Search/Search';
import { Chat } from '../../containers/Chat/Chat';
import { StaffManagementList } from '../../containers/StaffManagement/StaffManagementList/StaffManagementList';
import { StaffManagement } from '../../containers/StaffManagement/StaffManagement';
import { ContactProfile } from '../../containers/Profile/Contact/ContactProfile';
import { UserProfile } from '../../containers/Profile/User/UserProfile';
import { MyAccount } from '../../containers/MyAccount/MyAccount';
import { HSMPage } from '../../components/pages/Template/HSMPage/HSMPage';
import { HSM } from '../../containers/Template/Form/HSM/HSM';
import { SettingList } from '../../containers/SettingList/SettingList';
import { Providers } from '../../containers/SettingList/Providers/Providers';
import { BlockContactList } from '../../containers/BlockContact/BlockContactList/BlockContactList';
import { Layout } from '../../components/UI/Layout/Layout';
import { getUserRole } from '../../context/role';
import { Organisation } from '../../containers/SettingList/Organisation/Organisation';
import { useToast } from '../../services/ToastService';
import { ChatSubscription } from '../../containers/Chat/ChatSubscription/ChatSubscription';
import { WebhookLogsList } from '../../containers/WebhookLogs/WebhookLogsList/WebhookLogsList';
import Loading from '../../components/UI/Layout/Loading/Loading';

const defaultRedirect = () => <Redirect to="/chat" />;

const routeStaff = (
  <Switch>
    <Route path="/chat" exact component={Chat} />
    <Route exact path="/chat/group" component={() => <Chat groupId={-1} />} />
    <Route
      exact
      path="/chat/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <Chat contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/group/:groupId"
      component={({ match }: RouteComponentProps<{ groupId: any }>) => (
        <Chat groupId={match.params.groupId} />
      )}
    />
    <Route path="/group" exact component={GroupList} />
    <Route path="/group/:id/contacts" exact component={GroupContact} />
    <Route path="/user-profile" exact component={UserProfile} />
    <Route path="/contact-profile/:id" exact component={ContactProfile} />
    <Route path="/blocked-contacts" exact component={BlockContactList} />
    <Route path="/myaccount" exact component={MyAccount} />
    <Route path="/" render={defaultRedirect} />
  </Switch>
);

const routeAdmin = (
  <Switch>
    <Route path="/tag" exact component={TagPage} />
    <Route path="/tag/add" exact component={Tag} />
    <Route path="/tag/:id/edit" exact component={Tag} />
    <Route path="/speed-send" exact component={SpeedSendPage} />
    <Route path="/speed-send/add" exact component={SpeedSend} />
    <Route path="/speed-send/:id/edit" exact component={SpeedSend} />
    <Route path="/flow" exact component={FlowList} />
    <Route path="/flow/add" exact component={Flow} />
    <Route path="/flow/:id/edit" exact component={Flow} />
    <Route path="/group" exact component={GroupList} />
    <Route path="/group/add" exact component={Group} />
    <Route path="/group/:id/edit" exact component={Group} />
    <Route path="/group/:id/contacts" exact component={GroupContact} />

    <Route path="/flow/configure/:uuid" exact component={FlowEditor} />

    <Route path="/search" exact component={SearchList} />
    <Route path="/search/add" exact component={Search} />
    <Route path="/search/:id/edit" exact component={Search} />

    <Route path="/chat" exact component={Chat} />
    <Route path="/staff-management" exact component={StaffManagementList} />
    <Route path="/staff-management/:id/edit" exact component={StaffManagement} />
    <Route path="/contact-profile/:id" exact component={ContactProfile} />
    <Route path="/user-profile" exact component={UserProfile} />

    <Route path="/myaccount" exact component={MyAccount} />

    <Route path="/template" exact component={HSMPage} />
    <Route path="/template/add" exact component={HSM} />
    <Route path="/template/:id/edit" exact component={HSM} />

    <Route path="/settings" exact component={SettingList} />
    <Route path="/settings/organization" exact component={Organisation} />
    <Route path="/settings/:type" exact component={Providers} />
    <Route path="/blocked-contacts" exact component={BlockContactList} />
    <Route path="/webhook-logs" exact component={WebhookLogsList} />
    <Route exact path="/chat/group" component={() => <Chat groupId={-1} />} />
    <Route
      exact
      path="/chat/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <Chat contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/group/:groupId"
      component={({ match }: RouteComponentProps<{ groupId: any }>) => (
        <Chat groupId={match.params.groupId} />
      )}
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

  if (userRole.includes('Manager') || userRole.includes('Admin')) {
    route = routeAdmin;
  }

  const loadingSpinner = <Loading />;
  route = dataLoaded ? route : null;
  // let's call chat subscriptions at this level so that we can listen to actions which are not performed
  // on chat screen, for eg: send message to group
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
