import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as AuthService from 'services/AuthService';
import {
  AccessRole,
  POSTHOG_GROUP_TYPE_ORGANIZATION,
  getAccessRoleLabels,
  identifyPostHogOrganizationGroup,
  identifyPostHogUser,
  setupPostHogFromStoredSession,
  setupPostHogUserAndOrganization,
} from './PostHogService';

const createPostHogMock = () => ({
  identify: vi.fn(),
  group: vi.fn(),
});

describe('PostHogService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAccessRoleLabels', () => {
    it('returns labels from access roles', () => {
      expect(getAccessRoleLabels([{ label: 'Admin' }, { label: 'Manager' }] as AccessRole[])).toEqual([
        'Admin',
        'Manager',
      ]);
    });

    it('filters out roles without a label', () => {
      expect(getAccessRoleLabels([{ label: 'Admin' }, { label: undefined }, {}])).toEqual(['Admin']);
    });

    it('returns an empty array when roles are missing', () => {
      expect(getAccessRoleLabels(null)).toEqual([]);
    });
  });

  describe('identifyPostHogUser', () => {
    it('does nothing when posthog client is missing', () => {
      expect(() => identifyPostHogUser(undefined, { id: '1' })).not.toThrow();
    });

    it('identifies the user without properties when access roles are not provided', () => {
      const posthog = createPostHogMock();

      identifyPostHogUser(posthog, { id: 'user-1' });

      expect(posthog.identify).toHaveBeenCalledWith('user-1');
      expect(posthog.group).not.toHaveBeenCalled();
    });

    it('identifies the user with access_roles', () => {
      const posthog = createPostHogMock();

      identifyPostHogUser(posthog, { id: 'user-1', accessRoleLabels: ['Admin', 'Manager'] });

      expect(posthog.identify).toHaveBeenCalledWith('user-1', { access_roles: ['Admin', 'Manager'] });
    });
  });

  describe('identifyPostHogOrganizationGroup', () => {
    it('does nothing when posthog client is missing', () => {
      expect(() => identifyPostHogOrganizationGroup(null, { id: '1' })).not.toThrow();
    });

    it('does nothing when organization id is empty', () => {
      const posthog = createPostHogMock();

      identifyPostHogOrganizationGroup(posthog, { id: '' });

      expect(posthog.group).not.toHaveBeenCalled();
    });

    it('calls posthog.group without properties when is_trial is not set', () => {
      const posthog = createPostHogMock();

      identifyPostHogOrganizationGroup(posthog, { id: 'org-42' });

      expect(posthog.group).toHaveBeenCalledWith(POSTHOG_GROUP_TYPE_ORGANIZATION, 'org-42');
    });

    it('includes is_trial when provided', () => {
      const posthog = createPostHogMock();

      identifyPostHogOrganizationGroup(posthog, {
        id: 'org-42',
        isTrial: true,
      });

      expect(posthog.group).toHaveBeenCalledWith(POSTHOG_GROUP_TYPE_ORGANIZATION, 'org-42', {
        is_trial: true,
      });
    });
  });

  describe('setupPostHogUserAndOrganization', () => {
    it('identifies user and organization group', () => {
      const posthog = createPostHogMock();

      setupPostHogUserAndOrganization(posthog, { id: 'user-1', accessRoleLabels: ['Admin'] }, { id: 'org-1' });

      expect(posthog.identify).toHaveBeenCalledWith('user-1', { access_roles: ['Admin'] });
      expect(posthog.group).toHaveBeenCalledWith(POSTHOG_GROUP_TYPE_ORGANIZATION, 'org-1');
    });
  });

  describe('setupPostHogFromStoredSession', () => {
    it('does nothing when user session is incomplete', () => {
      const posthog = createPostHogMock();
      vi.spyOn(AuthService, 'getUserSession').mockReturnValue(null);

      setupPostHogFromStoredSession(posthog);

      expect(posthog.identify).not.toHaveBeenCalled();
      expect(posthog.group).not.toHaveBeenCalled();
    });

    it('syncs identify and group from stored session', () => {
      const posthog = createPostHogMock();
      vi.spyOn(AuthService, 'getUserSession').mockImplementation((key?: string) => {
        if (key === 'id') {
          return '7';
        }
        if (key === 'organizationId') {
          return '3';
        }
        if (key === 'roles') {
          return [{ label: 'Staff' }];
        }
        return null;
      });
      vi.spyOn(AuthService, 'getAuthSession').mockReturnValue(false);

      setupPostHogFromStoredSession(posthog);

      expect(posthog.identify).toHaveBeenCalledWith('7', { access_roles: ['Staff'] });
      expect(posthog.group).toHaveBeenCalledWith(POSTHOG_GROUP_TYPE_ORGANIZATION, '3', {
        is_trial: false,
      });
    });

    it('omits is_trial when trial status is not in auth session', () => {
      const posthog = createPostHogMock();
      vi.spyOn(AuthService, 'getUserSession').mockImplementation((key?: string) => {
        if (key === 'id') {
          return '7';
        }
        if (key === 'organizationId') {
          return '3';
        }
        return null;
      });
      vi.spyOn(AuthService, 'getAuthSession').mockReturnValue(null);

      setupPostHogFromStoredSession(posthog);

      expect(posthog.identify).toHaveBeenCalledWith('7');
      expect(posthog.group).toHaveBeenCalledWith(POSTHOG_GROUP_TYPE_ORGANIZATION, '3');
    });
  });
});
