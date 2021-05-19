import React from 'react';
import {ContainerStats, D3GElement} from 'types';
import * as d3 from 'd3';
import {parseDate, chain} from 'utils';
import {useD3} from 'hooks';

interface MemoryChartProps {
  stats: ContainerStats;
  className?: string;
};

export default function MemoryChart(props: MemoryChartProps) {
  let usage = props.stats.usage.map(u => ({
    ...u,
    measured_at: parseDate(u.measured_at)
  }));

  let requests = props.stats.requests.map(r => ({
    ...r,
    since: parseDate(r.since),
    till: parseDate(r.till) || new Date(),
  }));

  const ref = useD3((svg, {width, height}) => {
    let margin = {top: 20, right: 30, bottom: 30, left: 40};

    let requestsCoords = requests.reduce((coords: {x: Date, y: number}[], request) => {
      if (request.memory_limit_mi) {
        coords.push({
          x: request.since,
          y: request.memory_limit_mi,
        });
        coords.push({
          x: request.till,
          y: request.memory_limit_mi,
        });
      }
      return coords;
    }, []);

    let x = d3.scaleTime()
      .domain(d3.extent(usage, u => u.measured_at) as [Date, Date]).nice()
      .range([margin.left, width - margin.right]);

    let yDomain = d3.extent(chain(
      usage.map(u => u.memory_mi),
      requests.map(r => r.memory_limit_mi).filter(limit => !!limit) as number[],
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

    let usageLine = d3.line<typeof usage[0]>()
      .x(u => x(u.measured_at))
      .y(u => y(u.memory_mi));

    let requestsLine = d3.line<typeof requestsCoords[0]>()
      .x(r => x(r.x))
      .y(r => y(r.y));

    svg.append('g')
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    svg.append('path')
      .datum(usage)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', usageLine);

    svg.append('path')
      .datum(requestsCoords)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', requestsLine);
  }, [requests, usage]);

  return <svg ref={ref} className={props.className} />;
}
