import React from 'react';
import API from 'api';
import {Workload} from 'types';
import styles from './App.module.css';
import WorkloadCard from './WorkloadCard';

export default function App() {
  const [workload, setWorkload] = React.useState<Workload>();

  React.useState(async () => {
    let workload = await API.fetch('workload-stats/146').then(r => r.json());
    setWorkload(workload);
  });

  return (
    <div className={styles.container}>
      {workload && (
        <WorkloadCard workload={workload} />
      )}
    </div>
  );
}
