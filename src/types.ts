export interface Workload {
  id: number;
  kind: WorkloadKind;
  namespace: string;
  name: string;
  affinity: any;
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
  max_memory_mi: number;
  avg_memory_mi: number;
  stddev_memory_mi: number;
  memory_limit_mi: number|null;
  max_cpu_m: number;
  avg_cpu_m: number;
  stddev_cpu_m: number;
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
  memory_reason: string;
  cpu_reason: string;
  priority: number;
};

export interface NestedSuggestion extends BaseSuggestion {
};

export interface Suggestion extends BaseSuggestion {
  summary: Summary;
};

export type D3GElement = d3.Selection<SVGGElement, unknown, null, undefined>;

export type D3RenderFunc = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, size: Size) => void;

export type ChartRenderFunc = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, size: Size, axes: {
  x: d3.ScaleTime<number, number>,
  y: d3.ScaleLinear<number, number>,
}) => void;

export interface Size {
  width: number;
  height: number;
}
