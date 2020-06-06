import React from 'react';

import styles from './Content.module.css';

export interface ContentProps {}

export const Content: React.SFC<ContentProps> = (props) => {
  return (
    <div className={styles.Content}>
      <main>{props.children}</main>
    </div>
  );
};

export default Content;
