import { getAuthSession, getUserSession } from 'services/AuthService';

/** PostHog group type for Glific organizations (singular per PostHog group analytics docs). */
export const POSTHOG_GROUP_TYPE_ORGANIZATION = 'organization';

export interface PostHogOrganizationGroup {
  id: string;
  name?: string;
  isTrial?: boolean;
}

export interface PostHogUserIdentity {
  id: string;
  accessRoleLabels?: string[];
}

export type AccessRole = { label?: string };

export function getAccessRoleLabels(roles: AccessRole[] | null | undefined): string[] {
  if (!roles?.length) {
    return [];
  }

  return roles.map((role) => role.label).filter((label): label is string => Boolean(label));
}

export type PostHogAnalyticsClient =
  | {
      identify: (distinctId: string, properties?: Record<string, unknown>) => void;
      group: (groupType: string, groupKey: string, groupProperties?: Record<string, unknown>) => void;
    }
  | null
  | undefined;

export function identifyPostHogUser(posthog: PostHogAnalyticsClient, user: PostHogUserIdentity): void {
  if (!posthog) {
    return;
  }

  const properties: Record<string, string[]> = {};

  if (user.accessRoleLabels?.length) {
    properties.access_roles = user.accessRoleLabels;
  }

  if (Object.keys(properties).length) {
    posthog.identify(user.id, properties);
    return;
  }

  posthog.identify(user.id);
}

export function identifyPostHogOrganizationGroup(
  posthog: PostHogAnalyticsClient,
  organization: PostHogOrganizationGroup
): void {
  if (!posthog || !organization.id) {
    return;
  }

  const groupProperties: Record<string, unknown> = {};

  if (organization.name) {
    groupProperties.name = organization.name;
  }

  if (organization.isTrial !== undefined) {
    groupProperties.is_trial = organization.isTrial;
  }

  if (Object.keys(groupProperties).length) {
    posthog.group(POSTHOG_GROUP_TYPE_ORGANIZATION, organization.id, groupProperties);
    return;
  }

  posthog.group(POSTHOG_GROUP_TYPE_ORGANIZATION, organization.id);
}

export function setupPostHogUserAndOrganization(
  posthog: PostHogAnalyticsClient,
  user: PostHogUserIdentity,
  organization: PostHogOrganizationGroup
): void {
  identifyPostHogUser(posthog, user);
  identifyPostHogOrganizationGroup(posthog, organization);
}

export function setupPostHogFromStoredSession(posthog: PostHogAnalyticsClient): void {
  const userId = getUserSession('id');
  const organization = getUserSession('organization') as { id?: string | number; name?: string } | null;
  const organizationId = organization?.id;

  if (!userId || !organizationId) {
    return;
  }

  const isTrial = getAuthSession('is_trial');

  const accessRoleLabels = getAccessRoleLabels(getUserSession('roles') as AccessRole[] | null);

  const userParams = { id: String(userId), accessRoleLabels };
  const orgParams = {
    id: String(organizationId),
    name: organization?.name,
    isTrial: isTrial === null || isTrial === undefined ? undefined : Boolean(isTrial),
  };

  setupPostHogUserAndOrganization(posthog, userParams, orgParams);
}
