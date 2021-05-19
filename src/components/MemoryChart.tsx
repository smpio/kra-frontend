import React from 'react';
import {ContainerStats, D3GElement} from 'types';
import * as d3 from 'd3';
import {chain} from 'utils';
import {useD3} from 'hooks';

interface MemoryChartProps {
  stats: ContainerStats;
  className?: string;
};

export default function MemoryChart(props: MemoryChartProps) {
  const ref = useD3((svg, {width, height}) => {
    let margin = {top: 20, right: 30, bottom: 30, left: 40};

    let requestPoints = [];
    for (let r of props.stats.requests) {
      if (r.memory_limit_mi) {
        requestPoints.push({
          time: r.since,
          value: r.memory_limit_mi,
        });
        requestPoints.push({
          time: r.till || new Date(),
          value: r.memory_limit_mi,
        });
      }
    }

    let x = d3.scaleTime()
      .domain(d3.extent(props.stats.usage, u => u.measured_at) as [Date, Date]).nice()
      .range([margin.left, width - margin.right]);

    let yDomain = d3.extent(chain(
      props.stats.usage.map(u => u.memory_mi),
      requestPoints.map(r => r.value),
    )) as [number, number];

    let y = d3.scaleLinear()
      .domain(yDomain).nice()
      .range([height - margin.bottom, margin.top]);

    let xAxis = (g: D3GElement) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    let yAxis = (g: D3GElement) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('.tick:last-of-type text').clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Mi'));

    let usageLine = d3.line<typeof props.stats.usage[0]>()
      .x(u => x(u.measured_at))
      .y(u => y(u.memory_mi));

    let requestsLine = d3.line<typeof requestPoints[0]>()
      .x(r => x(r.time))
      .y(r => y(r.value));

    svg.append('g')
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    svg.append('path')
      .datum(props.stats.usage)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', usageLine);

    svg.append('path')
      .datum(requestPoints)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', requestsLine);
  }, [props.stats]);

  return <svg ref={ref} className={props.className} />;
}
