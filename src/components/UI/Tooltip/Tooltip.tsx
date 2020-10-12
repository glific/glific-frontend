import React, { ReactNode } from 'react';
import * as TooltipElement from '@material-ui/core/Tooltip';

import styles from './Tooltip.module.css';

interface TooltipProps {
  title: String;
  placement: TooltipElement.TooltipProps['placement'];
  children: ReactNode;
  tooltipClass?: string;
  tooltipArrowClass?: string;
}

export const Tooltip: React.SFC<TooltipProps> = (props: TooltipProps) => {
  // set the default styling for main tooltip
  const toolTipStyling = [styles.Tooltip];
  if (props.tooltipClass) {
    // we are adding the class in the front of array so that we can overide default properties.
    toolTipStyling.unshift(props.tooltipClass);
  }

  // set the default styling for tooltip arrow
  const toolTipArrowStyling = [styles.TooltipArrow];
  if (props.tooltipArrowClass) {
    // we are adding the class in the front of array so that we can overide default properties.
    toolTipArrowStyling.unshift(props.tooltipArrowClass);
  }

  return (
    <TooltipElement.default
      title={props.title}
      placement={props.placement}
      arrow
      classes={{ tooltip: toolTipStyling.join(','), arrow: toolTipArrowStyling.join(',') }}
    >
      <div>{props.children}</div>
    </TooltipElement.default>
  );
};
