import React from 'react';
import WorkloadCard from './WorkloadCard';
import { useWorkloads } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';

export default function WorkloadListPage() {
  const {isLoading, error, data} = useWorkloads();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDetail error={error} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      {data.map(workload => (
        <WorkloadCard key={workload.id} workload={workload} />
      ))}
    </div>
  );
}
