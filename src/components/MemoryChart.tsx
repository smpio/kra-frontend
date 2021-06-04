import React from 'react';
import {ContainerStats, ChartRenderFunc} from 'types';
import * as d3 from 'd3';
import Chart from './Chart';

interface MemoryChartProps {
  stats: ContainerStats;
  className?: string;
};

export default function MemoryChart(props: MemoryChartProps) {
  const postRender: ChartRenderFunc = (svg, _, {x, y}) => {
    let oomLine = d3.line<[Date, number]>()
      .x(i => x(i[0]))
      .y(i => y(i[1]));

    for (let oomEvent of props.stats.oom_events) {
      let d: [Date, number][] = [
        [oomEvent.happened_at, y.domain()[0]],
        [oomEvent.happened_at, y.domain()[1]],
      ];
      svg.append('path')
        .datum(d)
        .attr('fill', 'none')
        .attr('stroke', '#ff000088')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', oomLine);
    }
  };

  return <Chart
    className={props.className}
    stats={props.stats}
    valueProp="memory_mi"
    requestValueProp="memory_limit_mi"
    postRender={postRender}
    />;
}
