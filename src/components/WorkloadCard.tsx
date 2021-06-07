import React, { useMemo } from 'react';
import {Workload} from 'types';
import ContainerCard from './ContainerCard';
import styles from './WorkloadCard.module.css';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useWorkload, useAdjustmentMutation } from 'hooks';
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
    adjustments: true,
    stats: true,
    step: 5434,   // TODO: calc from width
  }, {
    enabled: inView,
  });
  const [affinityInfoVisible, setAffinityInfoVisible] = React.useState(false);
  const [pendingAdjustmentVisible, setPendingAdjustmentVisible] = React.useState(false);

  const [adjustments, setAdjustments] = React.useState(Object.fromEntries(props.workload.summary_set?.map(s => (
    [s.container_name, {
      cpu: s.suggestion?.new_cpu_request_m || s.cpu_request_m,
      mem: s.suggestion?.new_memory_limit_mi || s.memory_limit_mi,
    }]
  )) || []));

  const adjustmentMutation = useAdjustmentMutation();

  const summaryByContainerName = useMemo(
    () => Object.fromEntries(props.workload.summary_set?.map(s => [s.container_name, s]) || []),
    [props.workload.summary_set]
  );

  function handleRequestChange(containerName: string, res: 'cpu'|'mem', value: number|null) {
    setAdjustments(produce(adjustments, draft => {
      draft[containerName][res] = value;
    }));
  }

  const readyToApply = useMemo(() => Object.entries(adjustments).some(([cname, a]) => {
    let summary = summaryByContainerName[cname];
    return summary.cpu_request_m !== a.cpu || summary.memory_limit_mi !== a.mem;
  }),
  [adjustments, summaryByContainerName]);

  const pendingAdjustment = useMemo(() =>
    workload.data?.adjustment_set?.filter(adj => !adj.result)?.[0],
  [workload.data?.adjustment_set]);

  function applyAdjustment(when: 'now'|'tonight') {
    // TODO: update existing adjustment

    let scheduledFor = new Date();
    if (when === 'tonight') {
      scheduledFor.setDate(scheduledFor.getDate() + 1);
      scheduledFor.setHours(2, 0, 0, 0);
    }

    adjustmentMutation.mutate({
      id: pendingAdjustment?.id,
      workload: props.workload.id,
      scheduled_for: scheduledFor,
      containers: Object.entries(adjustments).map(([cname, a]) => ({
        container_name: cname,
        new_cpu_request_m: a.cpu,
        new_memory_limit_mi: a.mem,
      })),
    });
  }

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
          newMemLimit={adjustments[containerName]?.mem}
          newCpuRequest={adjustments[containerName]?.cpu}
          onMemLimitChange={handleRequestChange.bind(null, containerName, 'mem')}
          onCpuRequestChange={handleRequestChange.bind(null, containerName, 'cpu')}
          />
      ))}
      {workload.data && (
        <div className={styles.actions}>
          <span className={classnames({hidden: !readyToApply})}>
            <button onClick={applyAdjustment.bind(null, 'now')} disabled={adjustmentMutation.isLoading}>Apply now</button>
            {' '}
            <button onClick={applyAdjustment.bind(null, 'tonight')} disabled={adjustmentMutation.isLoading}>Apply tonight</button>
          </span>
          {adjustmentMutation.error && (
            <>
              {' '}
              <ErrorDetail error={adjustmentMutation.error} />
            </>
          )}
          {pendingAdjustment && (
            <>
              {' '}
              <button className={styles.pendingAdjustment} onPointerEnter={() => setPendingAdjustmentVisible(true)} onPointerLeave={() => setPendingAdjustmentVisible(false)}>≡</button>
            </>
          )}
        </div>
      )}
      {pendingAdjustment && pendingAdjustmentVisible && (
        <div className={styles.pendingAdjustmentInfo}>
          <div>Scheduled for: {pendingAdjustment.scheduled_for.toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Mem</th>
                <th>CPU</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdjustment.containers.map(c => (
                <tr key={c.container_name}>
                  <td>{c.container_name}</td>
                  <td>{c.new_memory_limit_mi} Mi</td>
                  <td>{c.new_cpu_request_m}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
