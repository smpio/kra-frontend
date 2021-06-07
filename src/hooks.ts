import React from 'react';
import * as d3 from 'd3';
import * as API from 'api';
import {useQuery, useMutation, UseQueryOptions, useQueryClient} from 'react-query';
import { Workload, D3RenderFunc } from 'types';
import produce from 'immer';

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

export function useWorkloads(options?: API.WorkloadQueryParams, queryOptions?: UseQueryOptions<Workload[]>) {
  return useQuery(['workloads', options], () => API.getWorkloads(options), queryOptions);
}

export function useWorkload(id: number, options?: API.WorkloadQueryParams, queryOptions?: UseQueryOptions<Workload>) {
  return useQuery(['workload', id, options], () => API.getWorkload(id, options), queryOptions);
}

export function useSuggestions() {
  return useQuery(['suggestions'], () => API.getSuggestions());
}

export function useAdjustmentMutation() {
  const queryClient = useQueryClient();

  return useMutation(API.mutateAdjustment, {
    onSuccess: adj => {
      function updateWorkload(wl: Workload) {
        if (wl.id !== adj.workload || !wl.adjustment_set) {
          return wl;
        }
        let idx = wl.adjustment_set.findIndex(a => a.id === adj.id);
        if (idx === -1) {
          return produce(wl, draft => {
            draft.adjustment_set?.push(adj);
          });
        } else {
          return produce(wl, draft => {
            if (draft.adjustment_set) {
              draft.adjustment_set[idx] = adj;
            }
          });
        }
      }

      queryClient.setQueriesData<Workload[]>({
        queryKey: 'workloads',
        inactive: false,
        fetching: false,
      }, workloads => workloads!.map(updateWorkload));

      queryClient.setQueriesData<Workload>({
        queryKey: 'workload',
        inactive: false,
        fetching: false,
      }, workload => updateWorkload(workload!));
    }
  });
}
