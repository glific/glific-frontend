import { Profile } from '../Profile';

export const UserProfile = () => (
  <div data-testid="UserProfile">
    <Profile profileType="User" redirectionLink="chat/" />
  </div>
);

export default UserProfile;
