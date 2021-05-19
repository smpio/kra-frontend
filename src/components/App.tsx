import React from 'react';
import * as API from 'api';
import {Workload} from 'types';
import styles from './App.module.css';
import WorkloadCard from './WorkloadCard';

export default function App() {
  const [workloads, setWorkloads] = React.useState<Workload[]>();

  React.useState(async () => {
    // let workloads = await API.getWorkloads();
    let workloads = [await API.getWorkload(146)];
    setWorkloads(workloads);
  });

  return (
    <div className={styles.container}>
      {workloads && workloads.map(workload => (
        <WorkloadCard key={workload.id} workload={workload} />
      ))}
    </div>
  );
}
