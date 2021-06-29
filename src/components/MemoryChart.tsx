import React from 'react';
import {BaseContainer, ChartRenderFunc} from 'types';
import * as d3 from 'd3';
import Chart from './Chart';

interface MemoryChartProps {
  containers: BaseContainer[];
  className?: string;
};

export default function MemoryChart(props: MemoryChartProps) {
  const postRender: ChartRenderFunc = (svg, _, {x, y}) => {
    for (let oomEvent of props.containers.flatMap(c => c.oomevent_set)) {
      svg.append('path')
        .datum([
          [x(oomEvent.happened_at), y.range()[0]],
          [x(oomEvent.happened_at), y.range()[1]],
        ] as [number,number][])
        .attr('fill', 'none')
        .attr('stroke', '#ff000088')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', d3.line());
    }
  };

  return <Chart
    className={props.className}
    containers={props.containers}
    valueProp={1}
    requestValueProp="memory_limit_mi"
    yAxisLabel="Mi"
    postRender={postRender}
    />;
}
