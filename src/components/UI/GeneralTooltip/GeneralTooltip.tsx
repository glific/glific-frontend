import React from 'react';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';

interface GeneralTooltipProps {
  title: String;
  placement: TooltipProps['placement'];
  body: any;
}

export const GeneralTooltip: React.SFC<GeneralTooltipProps> = (props: GeneralTooltipProps) => {
  return (
    <Tooltip title={props.title} placement={props.placement} arrow>
      {props.body}
    </Tooltip>
  );
};
