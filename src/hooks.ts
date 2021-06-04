import React from 'react';
import * as d3 from 'd3';
import * as API from 'api';
import {useQuery, UseQueryOptions} from 'react-query';
import { Workload, D3RenderFunc } from 'types';

export function useD3(renderFunc: D3RenderFunc, dependencies: React.DependencyList) {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    let svg = d3.select(ref.current);
    let width = ref.current.clientWidth;
    let height = ref.current.clientHeight;

    svg.selectChildren('*').remove();

    renderFunc(svg, {width, height});
  }, dependencies);  // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
};

export function useWorkloads(options?: API.WorkloadQueryParams) {
  return useQuery(['workloads', options], () => API.getWorkloads(options));
}

export function useWorkload(id: number, options?: API.WorkloadQueryParams, queryOptions?: UseQueryOptions<Workload>) {
  return useQuery(['workloads', id, options], () => API.getWorkload(id, options), queryOptions);
}

export function useSuggestions() {
  return useQuery(['suggestions'], () => API.getSuggestions());
}
