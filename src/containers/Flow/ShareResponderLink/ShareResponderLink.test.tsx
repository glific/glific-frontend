import { MockedProvider } from '@apollo/client/testing';
import ShareResponderLink from './ShareResponderLink';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Utils from 'common/utils';
import { setUserSession } from 'services/AuthService';
import { getOrganizationShortcode } from 'mocks/Organization';

describe('ShareResponderLink Component', () => {
  let wrapper: any;
  const shareResponderLinkProps = {
    shareDialogKeywords: [
      { label: 'test', id: 1 },
      { label: 'demo', id: 2 },
    ],
    handleClose: vi.fn(),
  };

  beforeEach(() => {
    setUserSession(JSON.stringify({ organization: { contact: { phone: '123456' } } }));

    wrapper = (
      <MockedProvider>
        <ShareResponderLink {...shareResponderLinkProps} />
      </MockedProvider>
    );
  });

  test('it should render ShareResponderLink component', async () => {
    render(wrapper);
    expect(screen.getByText('Share Responder Link')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('flowLink')).toHaveTextContent('wa.me/123456?text=test');
    });
  });

  test('it should call handleClose on dialog close', async () => {
    render(wrapper);
    expect(screen.getByText('Share Responder Link')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(shareResponderLinkProps.handleClose).toHaveBeenCalled();
    });
  });

  test('it copies responder link to clipboard', async () => {
    const copyToClipboardSpy = vi.spyOn(Utils, 'copyToClipboardMethod').mockImplementation(() => {});
    render(wrapper);

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

  describe('for a web flow', () => {
    const webWrapper = (keywords = shareResponderLinkProps.shareDialogKeywords) => (
      <MockedProvider mocks={[getOrganizationShortcode]}>
        <ShareResponderLink {...shareResponderLinkProps} shareDialogKeywords={keywords} channel="WEB" />
      </MockedProvider>
    );

    // A web chat link sends its keyword when the chat opens, where wa.me only pre-fills it.
    test('shares the web chat link that starts the flow, not a wa.me link', async () => {
      render(webWrapper());

      await waitFor(() => {
        expect(screen.getByTestId('flowLink')).toHaveTextContent('https://web.tides.glific.com/?start=test');
      });
      expect(screen.getByTestId('webChatAddress')).toHaveTextContent('https://web.tides.glific.com');
      expect(screen.queryByText('Bot Number')).not.toBeInTheDocument();
      expect(screen.getByText('Scan to open the web chat and start the flow')).toBeInTheDocument();
    });

    test('follows the keyword picked from the dropdown', async () => {
      render(webWrapper());
      await waitFor(() => expect(screen.getByTestId('flowLink')).toHaveTextContent('?start=test'));

      const autocomplete = screen.getByRole('combobox');
      autocomplete.focus();
      fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
      fireEvent.click(screen.getByText('demo'));

      await waitFor(() => {
        expect(screen.getByTestId('flowLink')).toHaveTextContent('https://web.tides.glific.com/?start=demo');
      });
    });

    test('encodes a keyword that is not URL-safe', async () => {
      render(webWrapper([{ label: 'adopt now', id: 1 }]));

      await waitFor(() => {
        expect(screen.getByTestId('flowLink')).toHaveTextContent('https://web.tides.glific.com/?start=adopt%20now');
      });
    });

    test('copies the web chat link', async () => {
      const copyToClipboardSpy = vi.spyOn(Utils, 'copyToClipboardMethod').mockImplementation(() => {});
      render(webWrapper());
      await waitFor(() => expect(screen.getByTestId('flowLink')).toHaveTextContent('?start=test'));

      fireEvent.click(screen.getByTestId('copyButton'));

      expect(copyToClipboardSpy).toHaveBeenCalledWith('https://web.tides.glific.com/?start=test');
    });
  });
});
