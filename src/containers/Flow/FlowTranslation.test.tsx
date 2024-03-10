import { render, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import * as Notification from 'common/notification';
import { FlowTranslation } from './FlowTranslation';
import {
  exportFlowTranslationsMock,
  exportFlowTranslationsWithErrors,
  getFlowTranslations,
  getFlowTranslationsWithErrors,
} from 'mocks/Flow';

const defaultmocks = [getFlowTranslations];

const mockSetDialog = vi.fn();
const flowTranslation = (mocks: any = defaultmocks) => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FlowTranslation loadFlowEditor={vi.fn()} flowId="1" setDialog={mockSetDialog} />
    </MockedProvider>
  );
};

describe('Testing Translation flows', () => {
  it('should render <FlowTranslation>', async () => {
    const wrapper = render(flowTranslation());
    await waitFor(() => {
      expect(wrapper.container).toBeInTheDocument();
    });
  });

  it('should autotranslate', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { getByText } = render(flowTranslation());

    const button = getByText('Submit');
    fireEvent.click(button);
    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Flow has been translated successfully');
    });
  });

  it('gets an error while inline translations', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { getByText } = render(flowTranslation([getFlowTranslationsWithErrors]));

    const button = getByText('Submit');
    fireEvent.click(button);
    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Sorry! Unable to translate flow', 'warning');
    });
  });

  it('exports flow translations', async () => {
    const { getByText } = render(flowTranslation([exportFlowTranslationsMock]));

    fireEvent.click(getByText('Export translations'));
    const submitButton = getByText('Submit');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockSetDialog).toHaveBeenCalledWith(false);
    });
  });

  it('exports flow translations with errors', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { getByText } = render(flowTranslation([exportFlowTranslationsWithErrors]));

    fireEvent.click(getByText('Export translations'));
    const submitButton = getByText('Submit');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockSetDialog).toHaveBeenCalledWith(false);
      expect(notificationSpy).toHaveBeenCalledWith(
        'An error occured while exporting flow translations',
        'warning'
      );
    });
  });
});
