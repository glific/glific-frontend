import { render, waitFor } from '@testing-library/react';
import HelpIcon from './HelpIcon';

const wrapper = (
  <HelpIcon
    helpData={{
      heading: 'Test heading',
      body: (
        <>
          <p>description</p>
        </>
      ),
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
