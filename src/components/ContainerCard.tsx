import {ContainerStats} from 'types';
import * as math from 'math';
import MemoryChart from './MemoryChart';
import CPUChart from './CPUChart';
import styles from './ContainerCard.module.css';

interface ContainerCardProps {
  name: string;
  stats: ContainerStats;
};

export default function ContainerCard(props: ContainerCardProps) {
  let usage = props.stats.usage;
  let mem = null;
  let cpu = null;

  if (usage.length > 0) {
    mem = {
      min: math.min(usage.map(u => u.memory_mi)),
      max: math.max(usage.map(u => u.memory_mi)),
      mean: math.mean(usage.map(u => u.memory_mi)),
      stdDev: math.stdDev(usage.map(u => u.memory_mi)),
      stdDevPercent: 0,
      limit: null as number|null,
    };

    mem.stdDevPercent = mem.stdDev / mem.mean * 100;
    if (props.stats.requests.length > 0) {
      mem.limit = props.stats.requests[props.stats.requests.length-1].memory_limit_mi;
    }

    let noNaN = props.stats.usage.filter(u => !isNaN(u.cpu_m));
    if (noNaN.length > 0) {
      cpu = {
        min: math.min(noNaN.map(u => u.cpu_m)),
        max: math.max(noNaN.map(u => u.cpu_m)),
        mean: math.mean(noNaN.map(u => u.cpu_m)),
        stdDev: math.stdDev(noNaN.map(u => u.cpu_m)),
        stdDevPercent: 0,
        request: null as number|null,
      };

      cpu.stdDevPercent = cpu.stdDev / cpu.mean * 100;
      if (props.stats.requests.length > 0) {
        cpu.request = props.stats.requests[props.stats.requests.length-1].cpu_request_m;
      }
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
    </div>
  );
}

ContainerCard.getStatsSteps = (cardWidth: number) => {
  let chartWidth = cardWidth / 2;
  let chartMargins = 70;
  return chartWidth - chartMargins;
};
