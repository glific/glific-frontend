import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';

interface GeneralTooltipProps {
  title: String;
  body: any;
}

export const GeneralTooltip: React.SFC<GeneralTooltipProps> = (props: GeneralTooltipProps) => {
  return (
    <Tooltip title={props.title} arrow>
      {props.body}
    </Tooltip>
  );
};
