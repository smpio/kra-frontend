import React from 'react';
import API from 'api';
import {Workload, WorkloadStats} from 'types';
import ContainerCard from './ContainerCard';
import styles from './WorkloadCard.module.css';

interface WorkloadCardProps {
  workload: Workload;
};

export default function WorkloadCard(props: WorkloadCardProps) {
  const [stats, setStats] = React.useState<WorkloadStats>();

  React.useState(async () => {
    let chartStepSec = 2717;  // TODO: calc from width
    let workload = await API.fetch(`workloads/${props.workload.id}?stats&step=${chartStepSec}`).then(r => r.json());
    setStats(workload.stats);
  });

  return (
    <div className={styles.card}>
      <h2>{props.workload.kind} {props.workload.namespace}/{props.workload.name}</h2>
      {stats && Object.entries(stats).map(([containerName, containerStats]) => (
        <ContainerCard
          key={containerName}
          name={containerName}
          stats={containerStats}
          />
      ))}
    </div>
  );
}
