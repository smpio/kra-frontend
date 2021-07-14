import React from 'react';
import {Workload, BaseSummary, BaseSuggestion, BaseContainer} from 'types';
import MemoryChart from './MemoryChart';
import CPUChart from './CPUChart';
import styles from './ContainerCard.module.css';
import {last} from 'utils';
import { useOOMEventMutation } from 'hooks';

interface ContainerCardProps {
  name: string;
  workload: Workload;
  containers?: BaseContainer[];
  summary: BaseSummary;
  suggestion?: BaseSuggestion;
  newMemLimit?: number|null;
  newCpuRequest?: number|null;
  onMemLimitChange?: (value: number|null) => void;
  onCpuRequestChange?: (value: number|null) => void;
};

export default function ContainerCard(props: ContainerCardProps) {
  let mem = {
    max: props.summary.max_memory_mi,
    mean: props.summary.avg_memory_mi,
    stdDev: props.summary.stddev_memory_mi,
    stdDevPercent: 0,
    limit: props.summary.memory_limit_mi,
  };
  mem.stdDevPercent = mem.stdDev / mem.mean * 100;

  let cpu = {
    max: props.summary.max_cpu_m,
    mean: props.summary.avg_cpu_m,
    stdDev: props.summary.stddev_cpu_m,
    stdDevPercent: 0,
    request: props.summary.cpu_request_m,
  };
  cpu.stdDevPercent = cpu.stdDev / cpu.mean * 100;

  let setNewMemLimit = props.onMemLimitChange ?? (() => null);
  let setNewCpuRequst = props.onCpuRequestChange ?? (() => null);

  const lastOOM = React.useMemo(() => {
    if (!props.containers) {
      return null;
    }
    var containersWithOOM = props.containers.filter(c => c.memory_limit_mi != null && c.oomevent_set.filter(c => !c.is_ignored).length > 0);
    if (containersWithOOM.length === 0) {
      return null;
    }
    containersWithOOM.sort((a, b) => a.memory_limit_mi! - b.memory_limit_mi!);
    let c = last(containersWithOOM);
    let oom = last(c.oomevent_set.filter(c => !c.is_ignored));
    return {
      ...oom,
      memory_limit_mi: c.memory_limit_mi,
    };
  }, [props.containers]);

  const hasUsage = !!props.containers?.[0]?.resource_usage_buckets;

  const oomEventMutation = useOOMEventMutation(props.workload.id);
  function ignoreLastOOM() {
    if (!lastOOM) return;
    oomEventMutation.mutate({
      ...lastOOM,
      is_ignored: true,
    });
  }

  return (
    <div className={styles.card}>
      <h3><code>{props.name}</code></h3>
      <div className={styles.row}>
        <div>
          <div className={styles.chartContainer}>
            {hasUsage && <MemoryChart containers={props.containers!} className={styles.chart} />}
          </div>
          {mem && (
            <div className={styles.summary}>
              {mem.max} {mem.limit !== null && <span className={styles.limit}>/ {mem.limit}</span>} Mi,
              mean: {mem.mean} Mi, stdDev: {mem.stdDev} Mi ({mem.stdDevPercent.toFixed(2)}%)
              {lastOOM && (
                <div>
                  OOM @ {lastOOM.happened_at.toLocaleString()}, {lastOOM.memory_limit_mi} Mi limit
                  {' '}<button className="link" onClick={ignoreLastOOM} disabled={oomEventMutation.isLoading}>ignore</button>
                </div>
              )}
            </div>
          )}
          {props.suggestion?.new_memory_limit_mi != null && (
            <div className={styles.suggestion}>
              <b>Suggestion</b> (priority {props.suggestion.priority}):<br/>
              set memory limit to {props.suggestion.new_memory_limit_mi} Mi
              (current: {props.summary.memory_limit_mi ?? 'not set'})
              <br/>
              {props.suggestion.memory_reason}
            </div>
          )}
          <div className={styles.form}>
            <label><input type="number" value={props.newMemLimit ?? ''} onChange={(e) => setNewMemLimit(parseInt(e.target.value))} /> Mi</label>
            {' '}
            <button onClick={() => setNewMemLimit(null)}>(none)</button>
            {props.summary.memory_limit_mi != null && (
              <>
                {' '}
                <button onClick={() => props.summary.memory_limit_mi && setNewMemLimit(props.summary.memory_limit_mi)}>{props.summary.memory_limit_mi} (cur)</button>
              </>
            )}
            {props.suggestion?.new_memory_limit_mi != null && (
              <>
                {' '}
                <button onClick={() => props.suggestion?.new_memory_limit_mi && setNewMemLimit(props.suggestion.new_memory_limit_mi)}>{props.suggestion.new_memory_limit_mi} (sug)</button>
              </>
            )}
          </div>
        </div>
        <div>
          <div className={styles.chartContainer}>
            {hasUsage && <CPUChart containers={props.containers!} className={styles.chart} />}
          </div>
          {cpu && (
            <div className={styles.summary}>
              {cpu.max} {cpu.request !== null && <span className={styles.limit}>/ {cpu.request}</span>} m,
              mean: {cpu.mean} m, stdDev: {cpu.stdDev} m ({cpu.stdDevPercent.toFixed(2)}%)
            </div>
          )}
          {props.suggestion?.new_cpu_request_m != null && (
            <div className={styles.suggestion}>
              <b>Suggestion</b> (priority {props.suggestion.priority}):<br/>
              set CPU request to {props.suggestion.new_cpu_request_m}m
              (current: {props.summary.cpu_request_m ?? 'not set'})
              <br/>
              {props.suggestion.cpu_reason}
            </div>
          )}
          <div className={styles.form}>
            <label><input type="number" value={props.newCpuRequest ?? ''} onChange={(e) => setNewCpuRequst(e.target.value ? parseInt(e.target.value) : null)} /> m</label>
            {' '}
            <button onClick={() => setNewCpuRequst(null)}>(none)</button>
            {props.summary.cpu_request_m != null && (
              <>
                {' '}
                <button onClick={() => props.summary.cpu_request_m && setNewCpuRequst(props.summary.cpu_request_m)}>{props.summary.cpu_request_m} (cur)</button>
              </>
            )}
            {props.suggestion?.new_cpu_request_m != null && (
              <>
                {' '}
                <button onClick={() => props.suggestion?.new_cpu_request_m && setNewCpuRequst(props.suggestion.new_cpu_request_m)}>{props.suggestion.new_cpu_request_m} (sug)</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ContainerCard.getStatsSteps = (cardWidth: number) => {
  let chartWidth = cardWidth / 2;
  let chartMargins = 70;
  return chartWidth - chartMargins;
};
