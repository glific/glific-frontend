import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import { VersionHistory } from './VersionHistory';
import * as Notification from 'common/notification';
import * as Logs from 'config/logs';
import {
    listRevisionsMock,
    listRevisionsEmptyMock,
    listRevisionsLoadingMock,
    revertRevisionMock,
    revertRevisionErrorMock,
} from 'mocks/VersionHistoryMocks';

vi.mock('common/notification', async (importOriginal) => {
    const mod = await importOriginal<typeof import('common/notification')>();
    return {
        ...mod,
        setNotification: vi.fn(),
    };
});

vi.mock('config/logs', async (importOriginal) => {
    const mod = await importOriginal<typeof import('config/logs')>();
    return {
        ...mod,
        default: vi.fn(),
    };
});

const mockOnRevisionReverted = vi.fn();

const wrapper = (mocks: any[] = [listRevisionsMock]) => {
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <VersionHistory whatsappFormId="form-1" onRevisionReverted={mockOnRevisionReverted} />
        </MockedProvider>
    );
};

describe('<VersionHistory />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders loading state initially', () => {
        render(wrapper([listRevisionsLoadingMock]));
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('renders version history title and subtitle', async () => {
        render(wrapper());

        await waitFor(() => {
            expect(screen.getByText('Version History')).toBeInTheDocument();
        });

        expect(screen.getByText('Last 10 revisions')).toBeInTheDocument();
    });

    test('displays empty state when no revisions are available', async () => {
        render(wrapper([listRevisionsEmptyMock]));

        await waitFor(() => {
            expect(screen.getByText('No revision history available')).toBeInTheDocument();
        });
    });

    test('displays list of revisions', async () => {
        render(wrapper());

        await waitFor(() => {
            expect(screen.getByText('Version 3')).toBeInTheDocument();
        });

        expect(screen.getByText('Version 2')).toBeInTheDocument();
        expect(screen.getByText('Version 1')).toBeInTheDocument();
    });

    test('displays "Current" badge for the first revision', async () => {
        render(wrapper());

        await waitFor(() => {
            expect(screen.getByText('Current')).toBeInTheDocument();
        });
    });

    test('displays formatted dates for revisions', async () => {
        render(wrapper());

        await waitFor(() => {

            const dateTexts = screen.getAllByText(/Jan/);
            expect(dateTexts.length).toBeGreaterThan(0);
            expect(dateTexts[0]).toBeInTheDocument();
        });
    });

    test('shows revert button only for non-current revisions', async () => {
        render(wrapper());

        await waitFor(() => {
            expect(screen.getByText('Version 3')).toBeInTheDocument();
        });

        const revertButtons = screen.getAllByText('Revert');
        expect(revertButtons.length).toBe(2);
    });

    test('opens revert dialog when revert button is clicked', async () => {
        render(wrapper());

        await waitFor(() => {
            expect(screen.getByText('Version 2')).toBeInTheDocument();
        });

        const revertButtons = screen.getAllByText('Revert');
        fireEvent.click(revertButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to revert?')).toBeInTheDocument();
        });

        expect(screen.getByText(/Revert to Version 2/)).toBeInTheDocument();
    });

    test('closes revert dialog when cancel is clicked', async () => {
        render(wrapper());

        await waitFor(() => {
            expect(screen.getByText('Version 2')).toBeInTheDocument();
        });

        const revertButtons = screen.getAllByText('Revert');
        fireEvent.click(revertButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to revert?')).toBeInTheDocument();
        });

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Are you sure you want to revert?')).not.toBeInTheDocument();
        });
    });

    test('reverts to revision successfully', async () => {
        const notificationSpy = vi.spyOn(Notification, 'setNotification');
        render(wrapper([listRevisionsMock, revertRevisionMock]));

        await waitFor(() => {
            expect(screen.getByText('Version 2')).toBeInTheDocument();
        });

        const revertButtons = screen.getAllByText('Revert');
        fireEvent.click(revertButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to revert?')).toBeInTheDocument();
        });

        // Use getByTestId to get the dialog's revert button (ok-button) instead of getByText
        const dialogRevertButton = screen.getByTestId('ok-button');
        fireEvent.click(dialogRevertButton);

        await waitFor(() => {
            expect(notificationSpy).toHaveBeenCalledWith('Successfully reverted to selected version', 'success');
        });

        expect(mockOnRevisionReverted).toHaveBeenCalled();
        expect(screen.queryByText('Are you sure you want to revert?')).not.toBeInTheDocument();
    });

    test('handles revert error', async () => {
        const notificationSpy = vi.spyOn(Notification, 'setNotification');
        const logsSpy = vi.spyOn(Logs, 'default');
        render(wrapper([listRevisionsMock, revertRevisionErrorMock]));

        await waitFor(() => {
            expect(screen.getByText('Version 2')).toBeInTheDocument();
        });

        const revertButtons = screen.getAllByText('Revert');
        fireEvent.click(revertButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to revert?')).toBeInTheDocument();
        });

        const dialogRevertButton = screen.getByTestId('ok-button');
        fireEvent.click(dialogRevertButton);

        await waitFor(() => {
            expect(notificationSpy).toHaveBeenCalledWith('Error reverting to version', 'warning');
        });

        expect(logsSpy).toHaveBeenCalled();
    });



    test('displays revision creation date in dialog', async () => {
        render(wrapper());

        await waitFor(() => {
            expect(screen.getByText('Version 2')).toBeInTheDocument();
        });

        const revertButtons = screen.getAllByText('Revert');
        fireEvent.click(revertButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to revert?')).toBeInTheDocument();
        });

        expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });
});
