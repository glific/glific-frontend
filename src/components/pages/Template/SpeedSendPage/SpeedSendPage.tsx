import React from 'react';
import { SpeedSendList } from '../../../../containers/Template/SpeedSend/SpeedSendList/SpeedSendList';

export interface SpeedSendPageProps {}

export const SpeedSendPage: React.SFC<SpeedSendPageProps> = () => {
  return (
    <div>
      <SpeedSendList />
    </div>
  );
};
