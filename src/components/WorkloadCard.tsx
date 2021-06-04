import React from 'react';
import {NestedSummary, Workload} from 'types';
import ContainerCard from './ContainerCard';
import styles from './WorkloadCard.module.css';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useWorkload } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';
import Tooltip from './Tooltip';

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

  let summaryByContainerName: {[cname: string]: NestedSummary} = {};
  if (props.workload.summary_set) {
    summaryByContainerName = props.workload.summary_set.reduce((map, s) => {
      map[s.container_name] = s;
      return map;
    }, summaryByContainerName);
  };

  let affinityInfo = null;
  if (props.workload.affinity) {
    let tooltip = (
      <div className={styles.tooltip}>
        <pre>{JSON.stringify(props.workload.affinity, null, 2)}</pre>
      </div>
    );
    affinityInfo = (
      <>
        {' '}
        <Tooltip content={tooltip}>
          <button className={styles.affinity}>≡</button>
        </Tooltip>
      </>
    );
  }

  return (
    <div ref={ref} className={styles.card}>
      <h2>
        <Link to={`/workload/${props.workload.id}`}><code>{props.workload.kind} {props.workload.namespace}/{props.workload.name}</code></Link>
        {affinityInfo}
      </h2>
      {workload.isLoading && <LoadingIndicator />}
      {workload.error && <ErrorDetail error={workload.error} />}
      {workload.data?.stats && Object.entries(workload.data.stats).map(([containerName, containerStats]) => (
        <ContainerCard
          key={containerName}
          name={containerName}
          stats={containerStats}
          summary={summaryByContainerName[containerName]}
          suggestion={summaryByContainerName[containerName]?.suggestion}
          />
      ))}
    </div>
  );
}
