import React from 'react';
import WorkloadCard from './WorkloadCard';
import { useWorkloads } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';
import { Workload } from 'types';
import { max } from 'math';

export default function WorkloadListPage() {
  const {isLoading, error, data} = useWorkloads({
    summary: true,
  });

  let sortKey = (wl: Workload) => max([0, ...wl.summary_set?.map(s => s.suggestion?.priority || 0) || [0]]);
  let workloads = data?.sort((a, b) => sortKey(b) - sortKey(a)) || [];

  return (
    <div>
      {isLoading && <LoadingIndicator />}
      {error && <ErrorDetail error={error} />}
      {workloads.map(workload => (
        <WorkloadCard key={workload.id} workload={workload} />
      ))}
    </div>
  );
}
