import React from 'react';
import * as tooltip from '@material-ui/core/Tooltip';

interface TooltipProps {
  title: String;
  placement: tooltip.TooltipProps['placement'];
  children: React.ReactNode;
}

export const Tooltip: React.SFC<TooltipProps> = (props: TooltipProps) => {
  return (
    <tooltip.default title={props.title} placement={props.placement} arrow>
      <div>{props.children}</div>
    </tooltip.default>
  );
};
