import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HelpIcon from './HelpIcon';
import { templateStatusInfo } from 'common/HelpData';

vi.mock('i18next', () => ({ t: (str: string) => str }));

const wrapper = (
  <HelpIcon
    helpData={{
      heading: 'Test heading',
      link: 'http://test.com',
    }}
  />
);

test('it should render help icon', async () => {
  const { getByTestId } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('help-icon')).toBeInTheDocument();
  });
});

test('templateStatusInfo heading renders the status descriptions on hover', async () => {
  render(<HelpIcon darkIcon={false} helpData={templateStatusInfo} />);

  fireEvent.mouseOver(screen.getByTestId('help-icon'));

  await waitFor(() => {
    expect(screen.getByText('Pending:')).toBeInTheDocument();
  });

  expect(screen.getByText('Approved:')).toBeInTheDocument();
  expect(screen.getByText('Rejected:')).toBeInTheDocument();
  expect(screen.getByText('Failed:')).toBeInTheDocument();
  expect(
    screen.getByText(
      'The template is under review and can take up to 24 hours. This status indicates that the template has not yet been approved or rejected.'
    )
  ).toBeInTheDocument();
});
