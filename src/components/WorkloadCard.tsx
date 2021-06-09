import React, { useMemo } from 'react';
import {Workload} from 'types';
import ContainerCard from './ContainerCard';
import styles from './WorkloadCard.module.css';
import { Link } from 'react-router-dom';
import { useAdjustmentMutation } from 'hooks';
import ErrorDetail from './ErrorDetail';
import produce from 'immer';
import classnames from 'classnames';

interface WorkloadCardProps {
  workload: Workload;
};

export default function WorkloadCard(props: WorkloadCardProps) {
  const wl = props.workload;

  const [affinityInfoVisible, setAffinityInfoVisible] = React.useState(false);
  const [pendingAdjustmentVisible, setPendingAdjustmentVisible] = React.useState(false);

  const [adjustments, setAdjustments] = React.useState(Object.fromEntries(wl.summary_set?.map(s => (
    [s.container_name, {
      cpu: s.suggestion?.new_cpu_request_m ?? s.cpu_request_m,
      mem: s.suggestion?.new_memory_limit_mi ?? s.memory_limit_mi,
    }]
  )) ?? []));

  const adjustmentMutation = useAdjustmentMutation();

  function handleRequestChange(containerName: string, res: 'cpu'|'mem', value: number|null) {
    setAdjustments(produce(adjustments, draft => {
      draft[containerName][res] = value;
    }));
  }

  const readyToApply = useMemo(() => wl.summary_set?.some(s => {
    let a = adjustments[s.container_name];
    return s.cpu_request_m !== a.cpu || s.memory_limit_mi !== a.mem;
  }), [adjustments, wl.summary_set]);

  const pendingAdjustment = useMemo(() =>
    wl.adjustment_set?.filter(adj => !adj.result)?.[0],
  [wl.adjustment_set]);

  function applyAdjustment(when: 'now'|'tonight') {
    let scheduledFor = new Date();
    if (when === 'tonight') {
      scheduledFor.setDate(scheduledFor.getDate() + 1);
      scheduledFor.setHours(2, 0, 0, 0);
    }

    adjustmentMutation.mutate({
      id: pendingAdjustment?.id,
      workload: wl.id,
      scheduled_for: scheduledFor,
      containers: Object.entries(adjustments).map(([cname, a]) => ({
        container_name: cname,
        new_cpu_request_m: a.cpu,
        new_memory_limit_mi: a.mem,
      })),
    });
  }

  return (
    <div className={styles.card}>
      <h2>
        <Link to={`/workload/${wl.id}`}><code>{wl.kind} {wl.namespace}/{wl.name}</code></Link>
        {wl.affinity && (
          <>
            {' '}
            <button className={styles.affinity} onPointerEnter={() => setAffinityInfoVisible(true)} onPointerLeave={() => setAffinityInfoVisible(false)}>≡</button>
          </>
        )}
      </h2>
      {affinityInfoVisible && (
        <pre className={styles.affinityInfo}>{JSON.stringify(wl.affinity, null, 2)}</pre>
      )}
      {wl.summary_set?.map(s => (
        <ContainerCard
          key={s.container_name}
          name={s.container_name}
          stats={wl.stats?.[s.container_name]}
          summary={s}
          suggestion={s.suggestion}
          newMemLimit={adjustments[s.container_name].mem}
          newCpuRequest={adjustments[s.container_name].cpu}
          onMemLimitChange={handleRequestChange.bind(null, s.container_name, 'mem')}
          onCpuRequestChange={handleRequestChange.bind(null, s.container_name, 'cpu')}
          />
      ))}
      {wl && (
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
