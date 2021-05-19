import React from 'react';
import * as API from 'api';
import {Workload, WorkloadStats} from 'types';
import ContainerCard from './ContainerCard';
import styles from './WorkloadCard.module.css';
import { useInView } from 'react-intersection-observer';

interface WorkloadCardProps {
  workload: Workload;
};

export default function WorkloadCard(props: WorkloadCardProps) {
  const [stats, setStats] = React.useState<WorkloadStats>();
  const {ref, inView} = useInView();

  if (!stats && inView) {
    (async () => {
      let workload = await API.getWorkload(props.workload.id, {
        stats: true,
        step: 5434,   // TODO: calc from width
      });
      setStats(workload.stats);
    })();
  }

  return (
    <div ref={ref} className={styles.card}>
      <h2>
        {props.workload.kind} {props.workload.namespace}/{props.workload.name}
        {' '}<span className={styles.id}>{props.workload.id}</span>
      </h2>
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
