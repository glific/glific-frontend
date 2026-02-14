import { vi, describe, it, expect, beforeEach } from 'vitest';
import { handleUpdateConversations } from './ChatSubscriptionUtils';
import * as SubscriptionService from 'services/SubscriptionService';

vi.mock('services/SubscriptionService', () => ({
    getSubscriptionDetails: vi.fn(),
    recordRequests: vi.fn(),
    switchSubscriptionToRefetch: vi.fn(),
}));

vi.mock('services/ChatService', () => ({
    saveConversation: vi.fn(),
}));

vi.mock('common/utils', () => ({
    addLogs: vi.fn(),
    randomIntFromInterval: vi.fn(() => 5),
}));

describe('ChatSubscriptionUtils', () => {
    let context: any;

    beforeEach(() => {
        vi.clearAllMocks();
        context = {
            subscriptionToRefetchSwitchHappened: { current: false },
            refetchTimer: { current: null },
            setTriggerRefetch: vi.fn(),
            getContactQuery: vi.fn(),
            queryVariables: {},
            triggerRefetch: false,
            entityIdsFetched: { current: [] },
        };
    });

    it('should return cachedConversations if subscriptionData is empty', () => {
        const cachedConversations = { search: [] };
        const subscriptionData = { data: null };
        const result = handleUpdateConversations(cachedConversations, subscriptionData, 'RECEIVED', context);
        expect(result).toBe(cachedConversations);
    });

    it('should return null if cachedConversations is null', () => {
        const subscriptionData = { data: { newMessage: {} } };
        const result = handleUpdateConversations(null, subscriptionData, 'RECEIVED', context);
        expect(result).toBeNull();
    });

    it('should return cachedConversations if search property is missing (the bug fix)', () => {
        const cachedConversations = {};
        const subscriptionData = { data: { newMessage: {} } };
        vi.mocked(SubscriptionService.getSubscriptionDetails).mockReturnValue({
            newMessage: {},
            entityId: '1',
        } as any);

        const result = handleUpdateConversations(cachedConversations, subscriptionData, 'RECEIVED', context);
        expect(result).toBe(cachedConversations);
    });

    it('should update conversation on RECEIVED action', () => {
        const cachedConversations = {
            search: [
                {
                    contact: { id: '1', lastMessageAt: 'old' },
                    messages: [],
                },
            ],
        };
        const subscriptionData = { data: { newMessage: {} } };
        const newMessage = { insertedAt: 'new', contact: { bspStatus: 'active' } };
        vi.mocked(SubscriptionService.getSubscriptionDetails).mockReturnValue({
            newMessage,
            entityId: '1',
        } as any);

        const result = handleUpdateConversations(cachedConversations, subscriptionData, 'RECEIVED', context);

        expect(result.search[0].contact.lastMessageAt).toBe('new');
        expect(result.search[0].messages[0]).toBe(newMessage);
    });

    it('should trigger refetch if switchSubscriptionToRefetch is true', () => {
        vi.useFakeTimers();
        const cachedConversations = { search: [] };
        const subscriptionData = { data: { newMessage: {} } };
        vi.mocked(SubscriptionService.switchSubscriptionToRefetch).mockReturnValue(true);

        handleUpdateConversations(cachedConversations, subscriptionData, 'SENT', context);

        expect(context.subscriptionToRefetchSwitchHappened.current).toBe(true);

        vi.runAllTimers();
        expect(context.setTriggerRefetch).toHaveBeenCalledWith(true);
        expect(context.subscriptionToRefetchSwitchHappened.current).toBe(false);
        vi.useRealTimers();
    });

    it('should handle COLLECTION action', () => {
        const cachedConversations = {
            search: [
                {
                    group: { id: 'coll_1' },
                    messages: [{ id: 'msg_1' }],
                },
            ],
        };
        const subscriptionData = { data: { newMessage: {} } };
        const newMessage = { id: 'msg_2', insertedAt: 'new' };
        vi.mocked(SubscriptionService.getSubscriptionDetails).mockReturnValue({
            newMessage,
            collectionId: 'coll_1',
        } as any);

        const result = handleUpdateConversations(cachedConversations, subscriptionData, 'COLLECTION', context);

        expect(result.search[0].messages[0]).toBe(newMessage);
    });
});
