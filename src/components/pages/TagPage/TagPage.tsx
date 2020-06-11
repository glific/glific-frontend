import React from 'react';
import { Typography } from '@material-ui/core';

import { TagList } from '../../../containers/Tag/TagList/TagList';

export interface TagPageProps {
  match: any;
}

export const TagPage: React.SFC<TagPageProps> = (props) => {
  return (
    <div>
      <Typography variant="h5">Tags</Typography>
      <TagList {...props} />
    </div>
  );
};
