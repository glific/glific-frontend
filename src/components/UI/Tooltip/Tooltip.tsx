import React, { ReactNode } from 'react';
import * as TooltipElement from '@material-ui/core/Tooltip';

import styles from './Tooltip.module.css';

interface TooltipProps {
  title: String;
  placement: TooltipElement.TooltipProps['placement'];
  children: ReactNode;
  tooltipClass?: string;
}

export const Tooltip: React.SFC<TooltipProps> = (props: TooltipProps) => {
  // set the default styling
  const toolTipStyling = [styles.Tooltip];
  if (props.tooltipClass) {
    // we are adding the class in the front of array so that we can overide default properties.
    toolTipStyling.unshift(props.tooltipClass);
  }

  return (
    <TooltipElement.default
      title={props.title}
      placement={props.placement}
      arrow
      classes={{ tooltip: toolTipStyling.join(' ,') }}
    >
      <div>{props.children}</div>
    </TooltipElement.default>
  );
};
