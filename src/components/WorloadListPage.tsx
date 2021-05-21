import React from 'react';
import * as API from 'api';
import {Workload} from 'types';
import WorkloadCard from './WorkloadCard';

export default function WorkloadListPage() {
  const [workloads, setWorkloads] = React.useState<Workload[]>();

  React.useState(async () => {
    let workloads = await API.getWorkloads();
    setWorkloads(workloads);
  });

  return (
    <div>
      {workloads && workloads.map(workload => (
        <WorkloadCard key={workload.id} workload={workload} />
      ))}
    </div>
  );
}
