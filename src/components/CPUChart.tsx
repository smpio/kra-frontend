import React from 'react';
import {ContainerStats, D3GElement} from 'types';
import * as d3 from 'd3';
import {parseDate, chain} from 'utils';

interface CPUChartProps {
  stats: ContainerStats;
  className?: string;
};

export default function CPUChart(props: CPUChartProps) {
  const ref = React.useRef<SVGSVGElement>(null);

  interface DataPoint {
    time: Date,
    value: number
  };

  let usage = props.stats.usage.map(u => ({
    ...u,
    measured_at: parseDate(u.measured_at)
  }));

  let usageCoords = usage.reduce((result: DataPoint[], u, idx) => {
    if (idx !== 0) {
      let prev = usage[idx-1];
      result.push({
        time: u.measured_at,
        value: 1000 * (u.cpu_m_seconds - prev.cpu_m_seconds) / (u.measured_at.getTime() - prev.measured_at.getTime()),
      });
    }

    return result;
  }, []);

  let requests = props.stats.requests.map(r => ({
    ...r,
    since: parseDate(r.since),
    till: parseDate(r.till) || new Date(),
  }));

  let requestsCoords = requests.reduce((coords: {x: Date, y: number}[], request) => {
    if (request.cpu_request_m) {
      coords.push({
        x: request.since,
        y: request.cpu_request_m,
      });
      coords.push({
        x: request.till,
        y: request.cpu_request_m,
      });
    }
    return coords;
  }, []);

  React.useEffect(() => {
    if (!ref.current) return;
    let svg = d3.select(ref.current);
    let width = ref.current.clientWidth;
    let height = ref.current.clientHeight;
    let margin = {top: 20, right: 30, bottom: 30, left: 40};

    // clean for rerender
    svg.selectChildren('*').remove();

    let x = d3.scaleTime()
      .domain(d3.extent(usageCoords, u => u.time) as [Date, Date]).nice()
      .range([margin.left, width - margin.right]);

    let yDomain = d3.extent(chain(
      usageCoords.map(u => u.value),
      requestsCoords.map(r => r.y),
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

    let usageLine = d3.line<typeof usageCoords[0]>()
      .x(u => x(u.time))
      .y(u => y(u.value));

    let requestsLine = d3.line<typeof requestsCoords[0]>()
      .x(r => x(r.x))
      .y(r => y(r.y));

    svg.append('g')
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    svg.append('path')
      .datum(usageCoords)
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
  }, [requestsCoords, usageCoords]);

  return <svg ref={ref} className={props.className} />;
}
