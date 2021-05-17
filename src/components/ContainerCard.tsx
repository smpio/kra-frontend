import {ContainerStats} from 'types';

interface ContainerCardProps {
  name: string;
  stats: ContainerStats;
};

export default function ContainerCard(props: ContainerCardProps) {
  return (
    <div>
      <h3>{props.name}</h3>
    </div>
  );
}
