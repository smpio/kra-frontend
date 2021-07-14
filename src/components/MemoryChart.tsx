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
      let y0 = y.range()[0];
      let y1 = y.range()[1];
      let color = '#ff0000bb';
      if (!oomEvent.is_critical) {
        y1 += 0.25 * (y0 - y1);
      }
      if (oomEvent.is_ignored) {
        color = '#a048ffbb';
      }
      svg.append('path')
        .datum([
          [x(oomEvent.happened_at), y0],
          [x(oomEvent.happened_at), y1],
        ] as [number,number][])
        .attr('fill', 'none')
        .attr('stroke', color)
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
