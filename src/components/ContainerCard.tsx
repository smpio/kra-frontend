import {ContainerStats} from 'types';
import * as math from 'math';
import MemoryChart from './MemoryChart';

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
    };
    stats.memStdDevPercent = stats.memStdDev / stats.memMean * 100;
    if (props.stats.requests.length > 0) {
      stats.memLimit = props.stats.requests[props.stats.requests.length-1].memory_limit_mi;
    }
  }

  return (
    <div>
      <h3>{props.name}</h3>
      {stats && (
        <div>
          Memory min: {stats.memMin} Mi<br/>
          Memory max: {stats.memMax} Mi<br/>
          Memory stdDev: {stats.memStdDev.toFixed(0)} Mi ({stats.memStdDevPercent.toFixed(2)}%)<br/>
          Memory limit: {stats.memLimit} Mi<br/>
        </div>
      )}
      <MemoryChart stats={props.stats} />
    </div>
  );
}
