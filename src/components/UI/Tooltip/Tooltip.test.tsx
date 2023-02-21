import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { Tooltip } from './Tooltip';

vi.mock('@mui/material/Tooltip', () => (...props: any) => {
  const { children, classes } = props[0];
  return (
    <div data-testid="tooltip" className={`${classes.tooltip} ${classes.arrow}`}>
      {children}
    </div>
  );
});

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
    const { container } = render(
      createTooltip({ tooltipArrowClass: 'tooltipArrow', tooltipClass: 'tooltip' })
    );
    expect(container.querySelector('.tooltipArrow')).toBeInTheDocument();
    expect(container.querySelector('.tooltip')).toBeInTheDocument();
  });
});
