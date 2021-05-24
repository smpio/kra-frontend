import React from 'react';
import {Workload} from 'types';
import ContainerCard from './ContainerCard';
import styles from './WorkloadCard.module.css';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useWorkload } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';

interface WorkloadCardProps {
  workload: Workload;
};

export default function WorkloadCard(props: WorkloadCardProps) {
  const {ref, inView} = useInView();
  const workload = useWorkload(props.workload.id, {
    stats: true,
    step: 5434,   // TODO: calc from width
  }, {
    enabled: inView,
  });

  return (
    <div ref={ref} className={styles.card}>
      <h2>
        <Link to={`/workload/${props.workload.id}`}><code>{props.workload.kind} {props.workload.namespace}/{props.workload.name}</code></Link>
        {' '}<span className={styles.id}>{props.workload.id}</span>
      </h2>
      {workload.isLoading && <LoadingIndicator />}
      {workload.error && <ErrorDetail error={workload.error} />}
      {workload.data?.stats && Object.entries(workload.data.stats).map(([containerName, containerStats]) => (
        <ContainerCard
          key={containerName}
          name={containerName}
          stats={containerStats}
          />
      ))}
    </div>
  );
}
