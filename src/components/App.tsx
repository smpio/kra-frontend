import React from 'react';
import API from 'api';
import {Workload} from 'types';
import styles from './App.module.css';
import WorkloadCard from './WorkloadCard';

export default function App() {
  const [workloads, setWorkloads] = React.useState<Workload[]>();

  React.useState(async () => {
    let workloads = await API.fetch('workloads/').then(r => r.json());
    //let workloads = [await API.fetch('workloads/146').then(r => r.json())];
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
