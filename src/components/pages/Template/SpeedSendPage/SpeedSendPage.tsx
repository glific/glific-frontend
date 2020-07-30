import React from 'react';
import { SpeedSendList } from '../../../../containers/Template/SpeedSend/SpeedSendList/SpeedSendList';

export interface SpeedSendPageProps {}

const SpeedSendPage: React.SFC<SpeedSendPageProps> = () => {
  return (
    <div>
      <SpeedSendList />
    </div>
  );
};

export default SpeedSendPage;
