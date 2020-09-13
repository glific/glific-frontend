import React, { useState, useEffect } from 'react';
import styles from './AuthenticatedRoute.module.css';
import { Switch, Route, RouteComponentProps, Redirect } from 'react-router';
import { TagPage } from '../../components/pages/TagPage/TagPage';
import { Tag } from '../../containers/Tag/Tag';
import { SpeedSendPage } from '../../components/pages/Template/SpeedSendPage/SpeedSendPage';
import { SpeedSend } from '../../containers/Template/Form/SpeedSend/SpeedSend';
import { AutomationList } from '../../containers/Automation/AutomationList/AutomationList';
import { Automation } from '../../containers/Automation/Automation';
import { GroupList } from '../../containers/Group/GroupList/GroupList';
import { Group } from '../../containers/Group/Group';
import { GroupContact } from '../../containers/Group/GroupContact/GroupContact';
import { FlowEditorContainer } from '../../components/floweditor/FlowEditorContainer/FlowEditorContainer';
import { CollectionList } from '../../containers/Collection/CollectionList/CollectionList';
import { Collection } from '../../containers/Collection/Collection';
import { Chat } from '../../containers/Chat/Chat';
import { StaffManagementList } from '../../containers/StaffManagement/StaffManagementList/StaffManagementList';
import { StaffManagement } from '../../containers/StaffManagement/StaffManagement';
import { ContactProfile } from '../../containers/Profile/Contact/ContactProfile';
import { UserProfile } from '../../containers/Profile/User/UserProfile';
import { MyAccount } from '../../containers/MyAccount/MyAccount';
import { HSMPage } from '../../components/pages/Template/HSMPage/HSMPage';
import { HSM } from '../../containers/Template/Form/HSM/HSM';
import { OrganisationSettings } from '../../containers/OrganisationSettings/OrganisationSettings';
import { BlockContactList } from '../../containers/BlockContact/BlockContactList/BlockContactList';
import { Logout } from '../../containers/Auth/Logout/Logout';
import { Layout } from '../../components/UI/Layout/Layout';
import { getUserRole } from '../../context/role';
import { useLazyQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../../graphql/queries/User';

export const AuthenticatedRoute: React.SFC = () => {
  const [userRole, setRole] = useState(getUserRole());

  const [getCurrentUser, { loading, data }] = useLazyQuery(GET_CURRENT_USER);

  useEffect(() => {
    if (userRole.length === 0) {
      getCurrentUser();
    }
  }, []);

  if (loading) return null;

  if (data && userRole.length === 0) {
    setRole(data.currentUser.user.roles);
  }

  const defaultRedirect = () => <Redirect to="/chat" />;
  let route;

  if (userRole.includes('Staff')) {
    route = (
      <Switch>
        <Route path="/chat" exact component={Chat} />
        <Route
          exact
          path="/chat/:contactId"
          component={({ match }: RouteComponentProps<{ contactId: any }>) => (
            <Chat contactId={match.params.contactId} />
          )}
        />
        <Route path="/group" exact component={GroupList} />
        <Route path="/user-profile" exact component={UserProfile} />
        <Route path="/myaccount" exact component={MyAccount} />
        <Route path="/logout" exact component={Logout} />
        <Route path="/" render={defaultRedirect} />
      </Switch>
    );
  }
  if (userRole.includes('Manager') || userRole.includes('Admin')) {
    route = (
      <Switch>
        <Route path="/tag" exact component={TagPage} />
        <Route path="/tag/add" exact component={Tag} />
        <Route path="/tag/:id/edit" exact component={Tag} />
        <Route path="/speed-send" exact component={SpeedSendPage} />
        <Route path="/speed-send/add" exact component={SpeedSend} />
        <Route path="/speed-send/:id/edit" exact component={SpeedSend} />
        <Route path="/automation" exact component={AutomationList} />
        <Route path="/automation/add" exact component={Automation} />
        <Route path="/automation/:id/edit" exact component={Automation} />
        <Route path="/group" exact component={GroupList} />
        <Route path="/group/add" exact component={Group} />
        <Route path="/group/:id/edit" exact component={Group} />
        <Route path="/group/:id/contacts" exact component={GroupContact} />

        <Route path="/automation/configure/:id" exact component={FlowEditorContainer} />

        <Route path="/collection" exact component={CollectionList} />
        <Route path="/collection/add" exact component={Collection} />
        <Route path="/collection/:id/edit" exact component={Collection} />

        <Route path="/chat" exact component={Chat} />
        <Route path="/staff-management" exact component={StaffManagementList} />
        <Route path="/staff-management/:id/edit" exact component={StaffManagement} />
        <Route path="/contact-profile/:id" exact component={ContactProfile} />
        <Route path="/user-profile" exact component={UserProfile} />

        <Route path="/myaccount" exact component={MyAccount} />

        <Route path="/template" exact component={HSMPage} />
        <Route path="/template/add" exact component={HSM} />
        <Route path="/template/:id/edit" exact component={HSM} />

        <Route path="/settings" exact component={OrganisationSettings} />
        <Route path="/blocked-contacts" exact component={BlockContactList} />

        <Route path="/logout" exact component={Logout} />

        <Route
          exact
          path="/chat/:contactId"
          component={({ match }: RouteComponentProps<{ contactId: any }>) => (
            <Chat contactId={match.params.contactId} />
          )}
        />
        <Route path="/" render={defaultRedirect} />
      </Switch>
    );
  }
  return (
    <div className={styles.App}>
      <Layout>{route}</Layout>
    </div>
  );
};

export default AuthenticatedRoute;
