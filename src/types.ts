export interface Workload {
  id: number;
  kind: WorkloadKind;
  namespace: string;
  name: string;
  priority: number;
  stats?: WorkloadStats;
};

export type WorkloadStats = {[containerName: string]: ContainerStats};

export type WorkloadKind = 'ReplicaSet' | 'Deployment' | 'DaemonSet' | 'CronJob' | 'StatefulSet' | 'Job';

export interface ContainerStats {
  requests: ResourceRequest[];
  usage: ResourceUsage[];
  // oom_events
};

export interface ResourceRequest {
  since: Date,
  till: Date|null,
  memory_limit_mi: number|null;
  cpu_request_m: number|null;
};

export interface ResourceUsage {
  measured_at: Date,
  memory_mi: number,
  cpu_m: number,
  cpu_m_seconds: number,
};

export type D3GElement = d3.Selection<SVGGElement, unknown, null, undefined>;
