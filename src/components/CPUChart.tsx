import React from 'react';
import {BaseContainer} from 'types';
import Chart from './Chart';

interface CPUChartProps {
  containers: BaseContainer[];
  className?: string;
};

export default function CPUChart(props: CPUChartProps) {
  return <Chart
    className={props.className}
    containers={props.containers}
    valueProp={2}
    requestValueProp="cpu_request_m"
    yAxisLabel="m"
    />;
}
