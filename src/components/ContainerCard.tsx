import React from 'react';
import {ContainerStats, D3GElement} from 'types';
import * as d3 from 'd3';
import styles from './ContainerCard.module.css';
import * as math from 'math';

interface ContainerCardProps {
  name: string;
  stats: ContainerStats;
};

export default function ContainerCard(props: ContainerCardProps) {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    let svg = d3.select(ref.current);
    let width = ref.current.clientWidth;
    let height = ref.current.clientHeight;
    let margin = {top: 20, right: 30, bottom: 30, left: 40};

    // clean for rerender
    svg.selectChildren('*').remove();

    let usage = props.stats.usage.map(u => ({...u, measured_at: new Date(u.measured_at + 'Z')}));

    let x = d3.scaleTime()
      .domain(d3.extent(usage, u => u.measured_at) as [Date, Date]).nice()
      .range([margin.left, width - margin.right]);

    let y = d3.scaleLinear()
      .domain(d3.extent(usage, u => u.memory_mi) as [number, number]).nice()
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

    let line = d3.line<typeof usage[0]>()
      .defined(d => !isNaN(d.memory_mi))
      .x(d => x(d.measured_at))
      .y(d => y(d.memory_mi));

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
      .attr('d', line);
  }, [props.stats]);

  let memMin = math.min(props.stats.usage.map(u => u.memory_mi));
  let memMax = math.max(props.stats.usage.map(u => u.memory_mi));
  let memMean = math.mean(props.stats.usage.map(u => u.memory_mi));
  let memStdDev = math.stdDev(props.stats.usage.map(u => u.memory_mi));
  let memStdDevPercent = memStdDev / memMean * 100;

  return (
    <div>
      <h3>{props.name}</h3>
      <div>
        Memory min: {memMin} Mi<br/>
        Memory max: {memMax} Mi<br/>
        Memory stdDev: {memStdDev.toFixed(0)} Mi ({memStdDevPercent.toFixed(2)}%)<br/>
      </div>
      <svg ref={ref} className={styles.chart} />
    </div>
  );
}
