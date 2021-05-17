import React from 'react';
import {useD3} from 'hooks';
import * as d3 from 'd3';

type D3GElement = d3.Selection<SVGGElement, unknown, null, undefined>;
type DataEntry = {
  date: Date,
  value: number,
};

export default function ExampleLineChart() {
  const [data, setData] = React.useState<DataEntry[]>();

  React.useState(async () => {
    let json = await import('./example-data.json');
    setData(json.data.map(d => ({...d, date: new Date(d.date)})));
  });

  const ref = useD3(svg => {
    if (!data) {
      return;
    }
    let s = svg.node();
    if (!s) {
      return;
    }

    let height = s.clientHeight;
    let width = s.clientWidth;
    let margin = ({top: 20, right: 30, bottom: 30, left: 40});

    let x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    let xAxis = (g: D3GElement) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    let y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number]).nice()
      .range([height - margin.bottom, margin.top]);

    let yAxis = (g: D3GElement) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('.tick:last-of-type text').clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('$ Close'));

    let line = d3.line<DataEntry>()
      .defined(d => !isNaN(d.value))
      .x(d => x(d.date))
      .y(d => y(d.value));

    svg.append('g')
        .call(xAxis);

    svg.append('g')
        .call(yAxis);

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line);
  }, [data]);

  return (
    <svg
      ref={ref}
      style={{
        height: 500,
        width: '100%',
      }}
    >
    </svg>
  );
}
