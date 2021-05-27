export interface Workload {
  id: number;
  kind: WorkloadKind;
  namespace: string;
  name: string;
  priority: number;
  summary_set?: NestedSummary[];
  stats?: WorkloadStats;
};

export type WorkloadStats = {[containerName: string]: ContainerStats};

export type WorkloadKind = 'ReplicaSet' | 'Deployment' | 'DaemonSet' | 'CronJob' | 'StatefulSet' | 'Job';

export interface ContainerStats {
  requests: ResourceRequest[];
  usage: ResourceUsage[];
  oom_events: OOMEvent[];
};

export interface ResourceRequest {
  since: Date;
  till: Date|null;
  memory_limit_mi: number|null;
  cpu_request_m: number|null;
};

export interface ResourceUsage {
  measured_at: Date;
  memory_mi: number;
  cpu_m: number;
  cpu_m_seconds: number;
};

export interface OOMEvent {
  id: number;
  happened_at: Date;
  container: number;
  target_comm: string;
  target_pid: number;
  victim_comm: string;
  victim_pid: number;
};

export interface BaseSummary {
  container_name: string;
  done_at: Date;
  max_memory_mi: number|null;
  memory_limit_mi: number|null;
  avg_cpu_m: number|null;
  cpu_request_m: number|null;
};

export interface NestedSummary extends BaseSummary {
  suggestion?: NestedSuggestion;
};

export interface Summary extends BaseSummary {
  id: number;
  workload: number;
};

export interface BaseSuggestion {
  id: number;
  done_at: Date;
  new_memory_limit_mi: number|null;
  new_cpu_request_m: number|null;
  reason: string;
  priority: number;
};

export interface NestedSuggestion extends BaseSuggestion {
};

export interface Suggestion extends BaseSuggestion {
  summary: Summary;
};

export type D3GElement = d3.Selection<SVGGElement, unknown, null, undefined>;
