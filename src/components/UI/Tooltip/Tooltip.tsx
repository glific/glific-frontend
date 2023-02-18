import { Tooltip as TooltipElement } from '@material-ui/core';

import styles from './Tooltip.module.css';

interface TooltipProps {
  title: any;
  placement: any;
  children: any;
  tooltipClass?: string;
  tooltipArrowClass?: string;
  interactive?: boolean;
}

export const Tooltip = ({
  tooltipClass,
  tooltipArrowClass,
  title,
  placement,
  children,
  interactive,
}: TooltipProps) => {
  // set the default styling for main tooltip
  const toolTipStyling = [styles.Tooltip];
  // let's add the class passed in props so that we can override default properties.
  if (tooltipClass) {
    toolTipStyling.push(tooltipClass);
  }

  // set the default styling for tooltip arrow
  const toolTipArrowStyling = [styles.TooltipArrow];
  // let's add the class passed in props so that we can override default properties.
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
      interactive={interactive}
    >
      {children}
    </TooltipElement>
  );
};

export default Tooltip;
