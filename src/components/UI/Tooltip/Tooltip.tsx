import React, { ReactNode } from 'react';
import { Tooltip as TooltipElement } from '@material-ui/core';

import styles from './Tooltip.module.css';

interface TooltipProps {
  title: String;
  placement: any;
  children: ReactNode;
  tooltipClass?: string;
  tooltipArrowClass?: string;
}

export const Tooltip: React.SFC<TooltipProps> = (props: TooltipProps) => {
  const { tooltipClass, tooltipArrowClass, title, placement, children } = props;
  // set the default styling for main tooltip
  const toolTipStyling = [styles.Tooltip];
  // let's add the class passed in props so that we can overide default properties.
  if (tooltipClass) {
    toolTipStyling.push(tooltipClass);
  }

  // set the default styling for tooltip arrow
  const toolTipArrowStyling = [styles.TooltipArrow];
  // let's add the class passed in props so that we can overide default properties.
  if (tooltipArrowClass) {
    toolTipArrowStyling.push(tooltipArrowClass);
  }

  return (
    <TooltipElement
      title={title}
      data-testid="tooltip"
      placement={placement}
      arrow
      classes={{ tooltip: toolTipStyling.join(' '), arrow: toolTipArrowStyling.join(' ') }}
    >
      <span>{children}</span>
    </TooltipElement>
  );
};

export default Tooltip;
