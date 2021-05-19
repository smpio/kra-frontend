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
  let stats = null;
  if (props.stats.usage.length > 0) {
    stats = {
      memMin: math.min(props.stats.usage.map(u => u.memory_mi)),
      memMax: math.max(props.stats.usage.map(u => u.memory_mi)),
      memMean: math.mean(props.stats.usage.map(u => u.memory_mi)),
      memStdDev: math.stdDev(props.stats.usage.map(u => u.memory_mi)),
      memStdDevPercent: 0,
      memLimit: null as number|null,

      cpuMin: math.min(props.stats.usage.map(u => u.cpu_m)),
      cpuMax: math.max(props.stats.usage.map(u => u.cpu_m)),
      cpuMean: math.mean(props.stats.usage.map(u => u.cpu_m).filter(cpuM => !isNaN(cpuM))),
      cpuStdDev: math.stdDev(props.stats.usage.map(u => u.cpu_m).filter(cpuM => !isNaN(cpuM))),
      cpuStdDevPercent: 0,
      cpuRequest: null as number|null,
    };

    stats.memStdDevPercent = stats.memStdDev / stats.memMean * 100;
    if (props.stats.requests.length > 0) {
      stats.memLimit = props.stats.requests[props.stats.requests.length-1].memory_limit_mi;
    }

    stats.cpuStdDevPercent = stats.cpuStdDev / stats.cpuMean * 100;
    if (props.stats.requests.length > 0) {
      stats.cpuRequest = props.stats.requests[props.stats.requests.length-1].cpu_request_m;
    }
  }

  return (
    <div>
      <h3>{props.name}</h3>
      <div className={styles.row}>
        <MemoryChart stats={props.stats} className={styles.chart} />
        <CPUChart stats={props.stats} className={styles.chart} />
      </div>
      {stats && (
        <div className={styles.row}>
          <div>
            {stats.memMin}–{stats.memMax} Mi / <span className={styles.limit}>{stats.memLimit}</span> Mi,
            stdDev: {stats.memStdDev.toFixed(0)} Mi ({stats.memStdDevPercent.toFixed(2)}%)<br/>
          </div>
          <div>
            {stats.cpuMin.toFixed(0)}–{stats.cpuMax.toFixed(0)} m / <span className={styles.limit}>{stats.cpuRequest}</span> m,
            stdDev: {stats.cpuStdDev.toFixed(0)} m ({stats.cpuStdDevPercent.toFixed(2)}%)<br/>
          </div>
        </div>
      )}
    </div>
  );
}

ContainerCard.getStatsSteps = (cardWidth: number) => {
  let chartWidth = cardWidth / 2;
  let chartMargins = 70;
  return chartWidth - chartMargins;
};
