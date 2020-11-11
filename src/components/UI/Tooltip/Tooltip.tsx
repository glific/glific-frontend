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
  // let's add the class passed in props so that we can overide default properties.
  if (props.tooltipClass) {
    toolTipStyling.push(props.tooltipClass);
  }

  // set the default styling for tooltip arrow
  const toolTipArrowStyling = [styles.TooltipArrow];
  // let's add the class passed in props so that we can overide default properties.
  if (props.tooltipArrowClass) {
    toolTipArrowStyling.push(props.tooltipArrowClass);
  }

  return (
    <TooltipElement.default
      title={props.title}
      data-testid="tooltip"
      placement={props.placement}
      arrow
      classes={{ tooltip: toolTipStyling.join(' '), arrow: toolTipArrowStyling.join(' ') }}
    >
      <span>{props.children}</span>
    </TooltipElement.default>
  );
};
