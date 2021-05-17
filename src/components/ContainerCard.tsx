import {ContainerStats} from 'types';
import {useD3} from 'hooks';
import * as d3 from 'd3';
import ExampleBarChart from './ExampleBarChart';
import ExampleLineChart from './ExampleLineChart';

interface ContainerCardProps {
  name: string;
  stats: ContainerStats;
};

export default function ContainerCard(props: ContainerCardProps) {
  return (
    <div>
      <h3>{props.name}</h3>
      <ExampleBarChart />
      <hr />
      <ExampleLineChart />
    </div>
  );
}
