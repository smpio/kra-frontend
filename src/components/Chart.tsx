import React from 'react';
import {BaseContainer, ResourceUsageBucket, D3GElement, ChartRenderFunc} from 'types';
import * as d3 from 'd3';
import {chain} from 'utils';
import {useD3} from 'hooks';
import palette from 'palette';

interface ChartProps {
  containers: BaseContainer[];
  valueProp: 1 | 2;
  requestValueProp: 'memory_limit_mi' | 'cpu_request_m';
  yAxisLabel?: string;
  postRender?: ChartRenderFunc;
  className?: string;
};

export default function Chart(props: ChartProps) {
  const ref = useD3((svg, {width, height}) => {
    if (!props.containers[0]?.resource_usage_buckets) return;

    let margin = {top: 5, right: 5, bottom: 20, left: 40};

    let x = d3.scaleTime()
      .domain(d3.extent(props.containers.flatMap(c => c.resource_usage_buckets!), b => b[0]) as [Date, Date])
      .range([margin.left, width - margin.right]);

    let requestPoints = [];
    for (let c of props.containers) {
      let requestValue = c[props.requestValueProp];
      if (!requestValue) {
        continue;
      }
      if (c.finished_at && c.finished_at < x.domain()[0]) {
        continue;
      }
      let since = c.started_at;
      if (since < x.domain()[0]) {
        since = x.domain()[0];
      }
      requestPoints.push({
        time: since,
        value: requestValue,
      });
      requestPoints.push({
        time: c.finished_at ?? new Date(),
        value: requestValue,
      });
    }

    let yDomain = d3.extent(chain(
      props.containers.flatMap(c => c.resource_usage_buckets!).map(u => u[props.valueProp]),
      props.containers.map(c => c[props.requestValueProp] ?? NaN),
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

    svg.append('g')
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    let usageIntervals: [number,number][] = [];
    let intervalsEnd = new Date().getTime();

    for (let c of props.containers) {
      let interval: [number,number] = [c.started_at.getTime(), c.finished_at?.getTime() ?? intervalsEnd];
      let colorIdx = countIntersections(usageIntervals, interval);
      let color = palette[colorIdx % palette.length];
      usageIntervals.push(interval);

      let usageLine = d3.line<ResourceUsageBucket>()
        .defined(b => !isNaN(b[props.valueProp]))
        .x(b => x(b[0]))
        .y(b => y(b[props.valueProp]));

      svg.append('path')
        .datum(c.resource_usage_buckets!)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', usageLine);

      let requestValue = c[props.requestValueProp];
      if (requestValue && (!c.finished_at || c.finished_at > x.domain()[0])) {
        let since = c.started_at;
        if (since < x.domain()[0]) {
          since = x.domain()[0];
        }

        svg.append('path')
          .datum([
            [x(since), y(requestValue)],
            [x(c.finished_at ?? new Date()), y(requestValue)],
          ] as [number,number][])
          .attr('fill', 'none')
          .attr('stroke', 'orange')
          .attr('stroke-width', 1.5)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('d', d3.line());
      }
    }

    if (props.postRender) {
      props.postRender(svg, {width, height}, {x, y});
    }
  }, [props.containers, props.valueProp, props.requestValueProp, props.postRender]);

  return <svg ref={ref} className={props.className} />;
}

let ALLOWED_INTERSECTION = 5 * 60 * 1000;

function countIntersections<T extends number>(intervals: [T,T][], interval: [T,T]) {
  let counter = 0;
  for (let interval2 of intervals) {
    if (interval[0] < (interval2[1] - ALLOWED_INTERSECTION) && interval[1] > (interval2[0] + ALLOWED_INTERSECTION)) {
      counter++;
    }
  }
  return counter;
}
