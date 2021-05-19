import {ContainerStats} from 'types';
import * as math from 'math';
import MemoryChart from './MemoryChart';

interface ContainerCardProps {
  name: string;
  stats: ContainerStats;
};

export default function ContainerCard(props: ContainerCardProps) {
  let memMin = math.min(props.stats.usage.map(u => u.memory_mi));
  let memMax = math.max(props.stats.usage.map(u => u.memory_mi));
  let memMean = math.mean(props.stats.usage.map(u => u.memory_mi));
  let memStdDev = math.stdDev(props.stats.usage.map(u => u.memory_mi));
  let memStdDevPercent = memStdDev / memMean * 100;
  let memLimit = props.stats.requests[props.stats.requests.length-1].memory_limit_mi;

  return (
    <div>
      <h3>{props.name}</h3>
      <div>
        Memory min: {memMin} Mi<br/>
        Memory max: {memMax} Mi<br/>
        Memory stdDev: {memStdDev.toFixed(0)} Mi ({memStdDevPercent.toFixed(2)}%)<br/>
        Memory limit: {memLimit} Mi<br/>
      </div>
      <MemoryChart stats={props.stats} />
    </div>
  );
}
