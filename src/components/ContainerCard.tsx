import {ContainerStats, BaseSummary, BaseSuggestion} from 'types';
import * as math from 'math';
import MemoryChart from './MemoryChart';
import CPUChart from './CPUChart';
import styles from './ContainerCard.module.css';

interface ContainerCardProps {
  name: string;
  stats: ContainerStats;
  summary: BaseSummary;
  suggestion?: BaseSuggestion;
};

export default function ContainerCard(props: ContainerCardProps) {
  let usage = props.stats.usage;
  let mem = null;
  let cpu = null;

  if (usage.length > 0) {
    mem = {
      min: math.min(usage.map(u => u.memory_mi)),
      max: props.summary.max_memory_mi,
      mean: math.mean(usage.map(u => u.memory_mi)),
      stdDev: math.stdDev(usage.map(u => u.memory_mi)),
      stdDevPercent: 0,
      limit: props.summary.memory_limit_mi,
    };

    mem.stdDevPercent = mem.stdDev / mem.mean * 100;

    let noNaN = props.stats.usage.filter(u => !isNaN(u.cpu_m));
    if (noNaN.length > 0) {
      cpu = {
        min: math.min(noNaN.map(u => u.cpu_m)),
        max: math.max(noNaN.map(u => u.cpu_m)),
        mean: props.summary.avg_cpu_m || 0,
        stdDev: math.stdDev(noNaN.map(u => u.cpu_m)),
        stdDevPercent: 0,
        request: props.summary.cpu_request_m,
      };

      cpu.stdDevPercent = cpu.stdDev / cpu.mean * 100;
    }
  }

  return (
    <div>
      <h3><code>{props.name}</code></h3>
      <div className={styles.row}>
        <MemoryChart stats={props.stats} className={styles.chart} />
        <CPUChart stats={props.stats} className={styles.chart} />
      </div>
      <div className={styles.row}>
        <div>
          {mem && (
            <div>
              {mem.min}–{mem.max} {mem.limit && <span className={styles.limit}> / {mem.limit}</span>} Mi,
              stdDev: {mem.stdDev.toFixed(0)} Mi ({mem.stdDevPercent.toFixed(2)}%)<br/>
            </div>
          )}
        </div>
        <div>
          {cpu && (
            <div>
              {cpu.min.toFixed(0)}–{cpu.max.toFixed(0)} {cpu.request && <span className={styles.limit}>/ {cpu.request}</span>} m,
              mean: {cpu.mean.toFixed(0)} m, stdDev: {cpu.stdDev.toFixed(0)} m ({cpu.stdDevPercent.toFixed(2)}%)<br/>
            </div>
          )}
        </div>
      </div>
      {renderSuggestion(props.summary, props.suggestion)}
    </div>
  );
}

ContainerCard.getStatsSteps = (cardWidth: number) => {
  let chartWidth = cardWidth / 2;
  let chartMargins = 70;
  return chartWidth - chartMargins;
};

function renderSuggestion(summary: BaseSummary, sug?: BaseSuggestion) {
  if (!sug) {
    return null;
  }

  return (
    <div>
      <div><b>Suggestion</b> (priority: {sug.priority}):</div>
      {sug.new_memory_limit_mi && (
        <div>new memory limit: {sug.new_memory_limit_mi}, current: {summary.memory_limit_mi}</div>
      )}
      {sug.new_cpu_request_m && (
        <div>new CPU request: {sug.new_cpu_request_m}, current: {summary.cpu_request_m}</div>
      )}
      <div>{sug.reason}</div>
    </div>
  );
}
