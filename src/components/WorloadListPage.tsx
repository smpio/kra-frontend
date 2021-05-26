import React from 'react';
import WorkloadCard from './WorkloadCard';
import { useSuggestions, useWorkloads } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';
import { Workload, Suggestion } from 'types';
import { sum } from 'math';

export default function WorkloadListPage() {
  const workloads = useWorkloads();
  const suggestions = useSuggestions();

  if (workloads.isLoading || suggestions.isLoading) {
    return <LoadingIndicator />;
  }

  if (workloads.error) {
    return <ErrorDetail error={workloads.error} />;
  }

  if (suggestions.error) {
    return <ErrorDetail error={suggestions.error} />;
  }

  if (!workloads.data || !suggestions.data) {
    return null;
  }

  let suggestionsByWorkloadId = suggestions.data.reduce((map, s) => {
    let wlId = s.summary.workload;
    if (!map[wlId]) {
      map[wlId] = [];
    }
    map[wlId].push(s);
    return map;
  }, {} as {[id: number]: Suggestion[]});

  let workloadsDecorated = workloads.data.map(wl => ({
    ...wl,
    suggestions: suggestionsByWorkloadId[wl.id],
  }));

  let sortKey = (wl: typeof workloadsDecorated[0]) => sum(wl.suggestions?.map(s => s.priority) || [0]);
  let workloadsDecoratedSorted = workloadsDecorated.sort((a, b) => sortKey(b) - sortKey(a));

  return (
    <div>
      {workloadsDecoratedSorted.map(workload => (
        <WorkloadCard key={workload.id} workload={workload} suggestions={workload.suggestions} />
      ))}
    </div>
  );
}
