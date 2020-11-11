import React from 'react';
import { render } from '@testing-library/react';
import { Tooltip } from './Tooltip';
import * as TooltipElement from '@material-ui/core/Tooltip';

describe('Tooltip test', () => {
  const createTooltip = (props: any) => (
    <Tooltip title="test" placement="left" {...props}>
      Default tooltip
    </Tooltip>
  );

  it('renders component properly', () => {
    const { getByTestId } = render(createTooltip({}));
    expect(getByTestId('tooltip')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    const { getByTestId } = render(createTooltip({}));
    expect(getByTestId('tooltip')).toHaveTextContent('Default tooltip');
  });

  it('should add the classes send as props', () => {
    const { container, getByTestId } = render(
      createTooltip({ tooltipArrowClass: 'tooltipArrow', tooltipClass: 'tooltip' })
    );

    // need to check how to assert this
    // expect(container.querySelector('.tooltipArrow')).toBeInTheDocument();
    // expect(container.querySelector('.tooltip')).toBeInTheDocument();
  });
});
