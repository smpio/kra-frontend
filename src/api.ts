import { Workload, WorkloadStats, Suggestion, NewAdjustment, Adjustment } from 'types';
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
  stats?: boolean;
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
  if (options?.stats) {
    params.set('stats', '');
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
  if (options?.stats) {
    params.set('stats', '');
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

  if (workload.stats) {
    let stats: WorkloadStats = {};

    for (let [containerName, containerStats] of Object.entries(workload.stats)) {
      stats[containerName] = {
        usage: containerStats.usage.map(u => ({
          ...u,
          measured_at: parseDate(u.measured_at as any),
        })),
        requests: containerStats.requests.map(r => ({
          ...r,
          since: parseDate(r.since as any),
          till: parseDate(r.till as any) ?? null,
        })),
        oom_events: containerStats.oom_events.map(e => ({
          ...e,
          happened_at: parseDate(e.happened_at as any),
        })),
      }
    }

    for (let containerStats of Object.values(stats)) {
      containerStats.usage.forEach((u, idx) => {
        if (idx === 0) {
          u.cpu_m = NaN;
        } else {
          let prev = containerStats.usage[idx-1];
          if (u.cpu_m_seconds > prev.cpu_m_seconds) {
            u.cpu_m = 1000 * (u.cpu_m_seconds - prev.cpu_m_seconds) / (u.measured_at.getTime() - prev.measured_at.getTime());
          } else {
            u.cpu_m = NaN;
          }
        }
      });
    }

    workload.stats = stats;
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
  return r.then(r => r.json()).then(adj => {
    adj.scheduled_for = parseDate(adj.scheduled_for);
    return adj;
  }) as Promise<Adjustment>;
}
