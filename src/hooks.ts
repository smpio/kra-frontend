import React from 'react';
import * as d3 from 'd3';
import * as API from 'api';
import {useQuery, useMutation, UseQueryOptions, useQueryClient, QueryClient} from 'react-query';
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
      updateWorkloadCache(queryClient, adj.workload, wl => {
        if (!wl.adjustment_set) {
          return wl;
        }
        let idx = wl.adjustment_set.findIndex(a => a.id === adj.id);
        if (idx === -1) {
          return produce(wl, draft => {
            draft.adjustment_set?.push(adj);
          });
        } else {
          return produce(wl, draft => {
            draft.adjustment_set![idx] = adj;
          });
        }
      });

      let refreshWorkloadAfter = adj.scheduled_for.getTime() - new Date().getTime() + 90000;
      setTimeout(() => {
        queryClient.refetchQueries(['workload', adj.workload], {active: true});
      }, refreshWorkloadAfter);
    }
  });
}

export function useOOMEventMutation(workloadId?: number) {
  const queryClient = useQueryClient();

  return useMutation(API.mutateOOMEvent, {
    onSuccess: oom => {
      if (!workloadId) return;
      updateWorkloadCache(queryClient, workloadId, wl => {
        if (!wl.pod_set) {
          return wl;
        }
        return produce(wl, draft => {
          for (let pod of draft.pod_set!) {
            for (let c of pod.container_set) {
              let idx = c.oomevent_set.findIndex(o => o.id === oom.id);
              if (idx !== -1) {
                c.oomevent_set[idx] = oom;
                return;
              }
            }
          }
        });
      });
    }
  });
}

function updateWorkloadCache(queryClient: QueryClient, workloadId: number, updateFunc: (wl: Workload) => Workload) {
  function updateWorkload(wl: Workload) {
    if (!wl || wl.id !== workloadId) {
      return wl;
    }
    return updateFunc(wl);
  }

  queryClient.setQueriesData<Workload[]>('workloads', workloads => workloads!.map(updateWorkload));
  queryClient.setQueriesData<Workload>(['workload', workloadId], workload => updateWorkload(workload!));
}
