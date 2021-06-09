import React from 'react';
import {ContainerStats} from 'types';
import Chart from './Chart';

interface CPUChartProps {
  stats: ContainerStats;
  className?: string;
};

export default function CPUChart(props: CPUChartProps) {
  return <Chart
    className={props.className}
    stats={props.stats}
    valueProp="cpu_m"
    requestValueProp="cpu_request_m"
    yAxisLabel="m"
    />;
}
