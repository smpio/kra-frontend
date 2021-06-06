import React, { useMemo } from 'react';
import {NestedSummary, Workload} from 'types';
import ContainerCard from './ContainerCard';
import styles from './WorkloadCard.module.css';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useWorkload } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';
import produce from 'immer';
import classnames from 'classnames';

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
  const [affinityInfoVisible, setAffinityInfoVisible] = React.useState(false);

  const [newRequests, setNewRequests] = React.useState(props.workload.summary_set?.reduce((to, s) => {
    to[s.container_name] = {
      cpu: s.suggestion?.new_cpu_request_m || s.cpu_request_m,
      mem: s.suggestion?.new_memory_limit_mi || s.memory_limit_mi,
    };
    return to;
  }, {} as {[cname: string]: {cpu: number|null, mem: number|null}}) || {});

  const summaryByContainerName = useMemo(() => props.workload.summary_set?.reduce((map, s) => {
    map[s.container_name] = s;
    return map;
  }, {} as {[cname: string]: NestedSummary}) || {},
  [props.workload.summary_set]);

  function handleRequestChange(containerName: string, res: 'cpu'|'mem', value: number|null) {
    setNewRequests(produce(newRequests, draft => {
      draft[containerName][res] = value;
    }));
  }

  const readyToApply = useMemo(() => Object.entries(newRequests).some(([containerName, request]) => {
    let summary = summaryByContainerName[containerName];
    return summary.cpu_request_m !== request.cpu || summary.memory_limit_mi !== request.mem;
  }),
  [newRequests, summaryByContainerName]);

  return (
    <div ref={ref} className={styles.card}>
      <h2>
        <Link to={`/workload/${props.workload.id}`}><code>{props.workload.kind} {props.workload.namespace}/{props.workload.name}</code></Link>
        {props.workload.affinity && (
          <>
            {' '}
            <button className={styles.affinity} onPointerEnter={() => setAffinityInfoVisible(true)} onPointerLeave={() => setAffinityInfoVisible(false)}>≡</button>
          </>
        )}
      </h2>
      {affinityInfoVisible && (
        <pre className={styles.affinityInfo}>{JSON.stringify(props.workload.affinity, null, 2)}</pre>
      )}
      {workload.isLoading && <LoadingIndicator />}
      {workload.error && <ErrorDetail error={workload.error} />}
      {workload.data?.stats && Object.entries(workload.data.stats).map(([containerName, containerStats]) => (
        <ContainerCard
          key={containerName}
          name={containerName}
          stats={containerStats}
          summary={summaryByContainerName[containerName]}
          suggestion={summaryByContainerName[containerName]?.suggestion}
          newMemLimit={newRequests[containerName]?.mem}
          newCpuRequest={newRequests[containerName]?.cpu}
          onMemLimitChange={handleRequestChange.bind(null, containerName, 'mem')}
          onCpuRequestChange={handleRequestChange.bind(null, containerName, 'cpu')}
          />
      ))}
      {workload.data?.stats && (
        <div className={classnames({
          [styles.actions]: true,
          hidden: !readyToApply,
        })}>
          <button>Apply now</button>
          {' '}
          <button>Apply tonight</button>
        </div>
      )}
    </div>
  );
}
