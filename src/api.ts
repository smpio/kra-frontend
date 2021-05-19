import { Workload, WorkloadStats } from 'types';
import {parseDate} from 'utils';

export const baseUrl = 'http://localhost:8000/';

export async function get(uri: string) {
  let url = new URL(uri, baseUrl);
  let response = await fetch(url.toString());
  if (!response.ok) {
    throw new APIError(response);
  }
  return response;
}

export async function getWorkload(id: number, options?: {stats?: boolean, step?: number}): Promise<Workload> {
  let params = new URLSearchParams();
  if (options?.stats) {
    params.set('stats', '');
  }
  if (options?.step) {
    params.set('step', options.step.toString());
  }
  let uri = `workloads/${id}?` + params.toString();

  let workload = await get(uri).then(r => r.json()) as Workload;
  cleanWorkload(workload);
  return workload;
}

export async function getWorkloads(options?: {stats?: boolean, step?: number}): Promise<Workload[]> {
  let params = new URLSearchParams();
  if (options?.stats) {
    params.set('stats', '');
  }
  if (options?.step) {
    params.set('step', options.step.toString());
  }
  let uri = `workloads/?` + params.toString();

  let workloads = await get(uri).then(r => r.json()) as Workload[];
  for (let workload of workloads) {
    cleanWorkload(workload);
  }
  return workloads;
}

function cleanWorkload(workload: Workload) {
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
          till: parseDate(r.till as any) || null,
        })),
      }
    }

    for (let containerStats of Object.values(stats)) {
      containerStats.usage.forEach((u, idx) => {
        if (idx === 0) {
          u.cpu_m = NaN;
        } else {
          let prev = containerStats.usage[idx-1];
          u.cpu_m = 1000 * (u.cpu_m_seconds - prev.cpu_m_seconds) / (u.measured_at.getTime() - prev.measured_at.getTime());
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
