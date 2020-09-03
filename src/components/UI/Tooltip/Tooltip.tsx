import React, { ReactNode } from 'react';
import * as TooltipElement from '@material-ui/core/Tooltip';

interface TooltipProps {
  title: String;
  placement: TooltipElement.TooltipProps['placement'];
  children: ReactNode;
  tooltipClass?: string;
}

export const Tooltip: React.SFC<TooltipProps> = (props: TooltipProps) => {
  return (
    <TooltipElement.default
      title={props.title}
      placement={props.placement}
      arrow
      classes={{ tooltip: props.tooltipClass }}
    >
      <div>{props.children}</div>
    </TooltipElement.default>
  );
};
