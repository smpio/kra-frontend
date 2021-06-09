import React from 'react';
import {ContainerStats, D3GElement, ChartRenderFunc} from 'types';
import * as d3 from 'd3';
import {chain} from 'utils';
import {useD3} from 'hooks';

interface ChartProps {
  stats: ContainerStats;
  valueProp: 'memory_mi' | 'cpu_m';
  requestValueProp: 'memory_limit_mi' | 'cpu_request_m';
  yAxisLabel?: string;
  postRender?: ChartRenderFunc;
  className?: string;
};

export default function Chart(props: ChartProps) {
  const ref = useD3((svg, {width, height}) => {
    let margin = {top: 5, right: 5, bottom: 20, left: 40};

    let x = d3.scaleTime()
      .domain(d3.extent(props.stats.usage, u => u.measured_at) as [Date, Date])
      .range([margin.left, width - margin.right]);

    let requestPoints = [];
    for (let r of props.stats.requests) {
      let requestValue = r[props.requestValueProp];
      if (!requestValue) {
        continue;
      }
      if (r.till && r.till < x.domain()[0]) {
        continue;
      }
      let since = r.since;
      if (since < x.domain()[0]) {
        since = x.domain()[0];
      }
      requestPoints.push({
        time: since,
        value: requestValue,
      });
      requestPoints.push({
        time: r.till ?? new Date(),
        value: requestValue,
      });
    }

    let yDomain = d3.extent(chain(
      props.stats.usage.map(u => u[props.valueProp]),
      requestPoints.map(r => r.value),
    )) as [number, number];

    let y = d3.scaleLinear()
      .domain(yDomain).nice()
      .range([height - margin.bottom, margin.top]);

    let xAxis = (g: D3GElement) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    let yAxisBase = (g: D3GElement) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove());

    let yAxis;
    if (props.yAxisLabel) {
      yAxis = (g: D3GElement) => yAxisBase(g)
        .call(g => g.select('.tick:last-of-type text').clone()
          .attr('x', 3)
          .attr('text-anchor', 'start')
          .attr('font-weight', 'bold')
          .text(props.yAxisLabel ?? ''));
    } else {
      yAxis = yAxisBase;
    }

    let usageLine = d3.line<typeof props.stats.usage[0]>()
      .defined(u => !isNaN(u[props.valueProp]))
      .x(u => x(u.measured_at))
      .y(u => y(u[props.valueProp]));

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

    if (props.postRender) {
      props.postRender(svg, {width, height}, {x, y});
    }
  }, [props.stats, props.valueProp, props.requestValueProp, props.postRender]);

  return <svg ref={ref} className={props.className} />;
}
