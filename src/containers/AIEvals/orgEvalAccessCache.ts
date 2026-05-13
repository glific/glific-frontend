import { getUserSession } from 'services/AuthService';

export const ORG_EVAL_ACCESS_CACHE_KEY = 'glific_org_eval_access_request';

export type OrgEvalAccessCacheStatus = 'approved' | 'pending' | 'none';

type CachedPayload = {
  organizationId: string;
  status: OrgEvalAccessCacheStatus;
};

export function getCachedOrgEvalAccessForCurrentOrg(): OrgEvalAccessCacheStatus | null {
  const orgId = getUserSession('organizationId');
  if (orgId == null) {
    return null;
  }
  try {
    const raw = localStorage.getItem(ORG_EVAL_ACCESS_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CachedPayload>;
    if (!parsed || typeof parsed.organizationId !== 'string' || typeof parsed.status !== 'string') {
      return null;
    }
    if (parsed.organizationId !== String(orgId)) {
      return null;
    }
    if (parsed.status === 'approved' || parsed.status === 'pending' || parsed.status === 'none') {
      return parsed.status;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeOrgEvalAccessCache(status: OrgEvalAccessCacheStatus) {
  const orgId = getUserSession('organizationId');
  if (orgId == null) {
    return;
  }
  const payload: CachedPayload = {
    organizationId: String(orgId),
    status,
  };
  localStorage.setItem(ORG_EVAL_ACCESS_CACHE_KEY, JSON.stringify(payload));
}

export function clearOrgEvalAccessCache() {
  localStorage.removeItem(ORG_EVAL_ACCESS_CACHE_KEY);
  sessionStorage.removeItem(ORG_EVAL_ACCESS_CACHE_KEY);
}
