import React from 'react';
import { useQuery } from '@apollo/client';

import styles from './UserProfile.module.css';
import { GET_CURRENT_USER } from '../../../graphql/queries/User';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { Profile } from '../Profile';

export interface UserProfileProps {}

export const UserProfile: React.SFC<UserProfileProps> = () => {
  const { data, loading } = useQuery(GET_CURRENT_USER);

  if (loading) return <Loading />;

  const contactParams: any = { match: { params: { id: data.currentUser.user.contact.id } } };

  return (
    <div className={styles.UserProfile} data-testid="UserProfile">
      <Profile {...contactParams} />
    </div>
  );
};
