import { useQuery } from '@apollo/client';
import { GET_ORG_EVAL_ACCESS_REQUEST } from 'graphql/queries/AIEvaluations';
import { useEffect, useMemo } from 'react';

import {
  getCachedOrgEvalAccessForCurrentOrg,
  writeOrgEvalAccessCache,
  type OrgEvalAccessCacheStatus,
} from 'containers/AIEvals/orgEvalAccessCache';

type OrgEvalAccessQueryData = {
  orgEvalAccessRequest?: { status?: string | null } | null;
};

export function parseOrgEvalAccessServerStatus(data: OrgEvalAccessQueryData | undefined): OrgEvalAccessCacheStatus {
  const raw = data?.orgEvalAccessRequest?.status;
  if (!raw) {
    return 'none';
  }
  const normalized = String(raw).toLowerCase();
  if (normalized === 'approved') {
    return 'approved';
  }
  if (normalized === 'pending') {
    return 'pending';
  }
  return 'pending';
}

export type UseOrgEvalAccessRequestResult = {
  /** Full-screen loading while the access query is in flight (skipped when cache is approved). */
  shouldShowFullScreenLoading: boolean;
  /** Full-screen error when the access query fails. */
  shouldShowFullScreenError: boolean;
  refetchAccess: () => void;
  /** Resolved status from cache or latest query result; null only before first successful resolution when a query runs. */
  accessStatus: OrgEvalAccessCacheStatus | null;
};

export function useOrgEvalAccessRequest(): UseOrgEvalAccessRequestResult {
  const skipQuery = getCachedOrgEvalAccessForCurrentOrg() === 'approved';

  const { data, loading, error, refetch } = useQuery<OrgEvalAccessQueryData>(GET_ORG_EVAL_ACCESS_REQUEST, {
    skip: skipQuery,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (skipQuery || !data) {
      return;
    }
    const status = parseOrgEvalAccessServerStatus(data);
    writeOrgEvalAccessCache(status);
  }, [skipQuery, data]);

  const accessStatus: OrgEvalAccessCacheStatus | null = useMemo(() => {
    if (skipQuery) {
      return 'approved';
    }
    if (data) {
      return parseOrgEvalAccessServerStatus(data);
    }
    return null;
  }, [skipQuery, data]);

  const shouldShowFullScreenLoading = !skipQuery && loading && !error;
  // Keep the full-screen error visible for failed refetches too, even after cache turns approved.
  const shouldShowFullScreenError = !!error;

  return {
    shouldShowFullScreenLoading,
    shouldShowFullScreenError,
    refetchAccess: () => {
      void refetch();
    },
    accessStatus,
  };
}
