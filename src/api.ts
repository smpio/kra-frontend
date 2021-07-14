import { Workload, Suggestion, NewAdjustment, Adjustment, BaseOOMEvent } from 'types';
import {parseDate} from 'utils';

export const baseUrl = 'http://localhost:8000/';

export async function request(uri: string, method = 'GET', data?: any) {
  let headers = {
    'Accept': 'application/json',
  } as any;
  if (data) {
    headers['Content-Type'] = 'application/json'
  }

  let url = new URL(uri, baseUrl);
  let response = await fetch(url.toString(), {
    method: method,
    headers: headers,
    body: data && JSON.stringify(data),
  });

  if (!response.ok) {
    throw new APIError(response);
  }

  return response;
}

export interface WorkloadQueryParams {
  summary?: boolean;
  adjustments?: boolean;
  pods?: boolean;
  usage?: boolean;
  step?: number;
};

export async function getWorkload(id: number, options?: WorkloadQueryParams): Promise<Workload> {
  let params = new URLSearchParams();
  if (options?.summary) {
    params.set('summary', '');
  }
  if (options?.adjustments) {
    params.set('adjustments', '');
  }
  if (options?.pods) {
    params.set('pods', '');
  }
  if (options?.usage) {
    params.set('usage', '');
  }
  if (options?.step) {
    params.set('step', options.step.toString());
  }
  let uri = `workloads/${id}?` + params.toString();

  let workload = await request(uri).then(r => r.json()) as Workload;
  cleanWorkload(workload);
  return workload;
}

export async function getWorkloads(options?: WorkloadQueryParams): Promise<Workload[]> {
  let params = new URLSearchParams();
  if (options?.summary) {
    params.set('summary', '');
  }
  if (options?.adjustments) {
    params.set('adjustments', '');
  }
  if (options?.pods) {
    params.set('pods', '');
  }
  if (options?.usage) {
    params.set('usage', '');
  }
  if (options?.step) {
    params.set('step', options.step.toString());
  }
  let uri = `workloads/?` + params.toString();

  let workloads = await request(uri).then(r => r.json()) as Workload[];
  for (let workload of workloads) {
    cleanWorkload(workload);
  }
  return workloads;
}

function cleanWorkload(workload: Workload) {
  if (workload.summary_set) {
    for (let s of workload.summary_set) {
      if (s.suggestion) {
        s.suggestion.done_at = parseDate(s.suggestion.done_at as any);
      }
    }
  }

  if (workload.adjustment_set) {
    for (let a of workload.adjustment_set) {
      a.scheduled_for = parseDate(a.scheduled_for as any);
    }
  }

  if (workload.pod_set) {
    for (let pod of workload.pod_set) {
      pod.started_at = parseDate(pod.started_at as any);
      pod.gone_at = parseDate(pod.gone_at as any);

      for (let c of pod.container_set) {
        c.started_at = parseDate(c.started_at as any);
        c.finished_at = parseDate(c.finished_at as any);

        for (let oom of c.oomevent_set) {
          oom.happened_at = parseDate(oom.happened_at as any);
        }

        if (c.resource_usage_buckets) {
          for (let bucket of c.resource_usage_buckets) {
            bucket[0] = parseDate(bucket[0] as any);
          }
          c.resource_usage_buckets = c.resource_usage_buckets.map((bucket, idx) => {
            var cpu_m = NaN;
            if (idx > 0) {
              let prev = c.resource_usage_buckets![idx-1];
              if (bucket[2] > prev[2]) {
                cpu_m = 1000 * (bucket[2] - prev[2]) / (bucket[0].getTime() - prev[0].getTime());
              }
            }
            return [bucket[0], bucket[1], cpu_m];
          });
        }
      }
    }
  }
}

export class APIError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    if (message) {
      super(message);
    } else {
      super(`${response.status} ${response.statusText}`);
    }

    this.name = this.constructor.name;
    this.response = response;
  }
}

export function getSuggestions(): Promise<Suggestion[]> {
  // TODO: parse dates
  return request('suggestions/').then(r => r.json()) as Promise<Suggestion[]>;
}

export async function mutateAdjustment(obj: NewAdjustment|Adjustment): Promise<Adjustment> {
  let r;
  if ('id' in obj && obj.id) {
    r = request(`adjustments/${obj.id}`, 'PUT', obj);
  } else {
    r = request('adjustments/', 'POST', obj);
  }
  return r.then(r => r.json()).then((adj: Adjustment) => {
    adj.scheduled_for = parseDate(adj.scheduled_for as any);
    return adj;
  });
}

export async function mutateOOMEvent(obj: BaseOOMEvent): Promise<BaseOOMEvent> {
  let r = request(`oom-events/${obj.id}`, 'PUT', obj);
  return r.then(r => r.json()).then(oom => {
    oom.happened_at = parseDate(oom.happened_at as any);
    return oom;
  });
}
