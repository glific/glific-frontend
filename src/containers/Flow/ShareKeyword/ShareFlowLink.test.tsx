import { MockedProvider, wait } from '@apollo/client/testing';
import { ShareFlowLink } from './ShareFlowLink';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Utils from 'common/utils';
import { setUserSession } from 'services/AuthService';

describe('ShareFlowLink Component', () => {
  const shareFlowLinkProps = {
    shareDialogKeywords: [
      { label: 'test', id: 1 },
      { label: 'demo', id: 2 },
    ],
    handleClose: vi.fn(),
  };

  const wrapper = (
    <MockedProvider>
      <ShareFlowLink {...shareFlowLinkProps} />
    </MockedProvider>
  );

  setUserSession(JSON.stringify({ organization: { contact: { phone: '123456' } } }));

  test('it should render ShareFlowLink component', async () => {
    render(wrapper);
    expect(screen.getByText('Share Link To a Flow')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('flowLink')).toHaveTextContent('wa.me/123456?text=test');
    });
  });

  test('it should call handleClose on dialog close', async () => {
    render(wrapper);
    expect(screen.getByText('Share Link To a Flow')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(shareFlowLinkProps.handleClose).toHaveBeenCalled();
    });
  });

  test('it copies flow link to clipboard', async () => {
    const copyToClipboardSpy = vi.spyOn(Utils, 'copyToClipboardMethod').mockImplementation(() => {});
    render(wrapper);

    fireEvent.click(screen.getByTestId('copyIcon'));

    await waitFor(() => {
      expect(copyToClipboardSpy).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('copyButton'));

    await waitFor(() => {
      expect(copyToClipboardSpy).toHaveBeenCalled();
    });
  });

  test('it should download QR code', async () => {
    render(wrapper);

    fireEvent.click(screen.getByTestId('downloadButton'));
    await waitFor(() => {});
  });

  test('it should change keyword from dropdown', async () => {
    render(wrapper);

    const autocomplete = screen.getByRole('combobox');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('demo'));

    await waitFor(() => {
      expect(screen.getByTestId('flowLink')).toHaveTextContent('wa.me/123456?text=demo');
    });
  });
});
