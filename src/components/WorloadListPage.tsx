import React from 'react';
import WorkloadCardLoader from './WorkloadCardLoader';
import { useWorkloads } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';
import { Workload } from 'types';
import { max } from 'math';

export default function WorkloadListPage() {
  const {isLoading, error, data} = useWorkloads({
    summary: true,
  }, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  let sortKey = (wl: Workload) => max([0, ...wl.summary_set?.map(s => s.suggestion?.priority || 0) || [0]]);
  let workloads = data?.sort((a, b) => sortKey(b) - sortKey(a)) || [];

  return (
    <div>
      {isLoading && <LoadingIndicator />}
      {error && <ErrorDetail error={error} />}
      {workloads.map(workload => (
        <WorkloadCardLoader key={workload.id} workloadId={workload.id} workload={workload} />
      ))}
    </div>
  );
}
