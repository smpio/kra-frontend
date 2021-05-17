import {Workload} from 'types';
import ContainerCard from './ContainerCard';

interface WorkloadCardProps {
  workload: Workload;
};

export default function WorkloadCard(props: WorkloadCardProps) {
  return (
    <div>
      <h2>{props.workload.kind} {props.workload.namespace}/{props.workload.name}</h2>
      {Object.entries(props.workload.stats).map(([containerName, containerStats]) => (
        <ContainerCard
          key={containerName}
          name={containerName}
          stats={containerStats}
          />
      ))}
    </div>
  );
}
