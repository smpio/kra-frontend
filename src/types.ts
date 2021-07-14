export interface Workload {
  id: number;
  kind: WorkloadKind;
  namespace: string;
  name: string;
  affinity: any;
  summary_set?: NestedSummary[];
  adjustment_set?: Adjustment[];
  pod_set?: NestedPod[];
};

export type WorkloadKind = 'ReplicaSet' | 'Deployment' | 'DaemonSet' | 'CronJob' | 'StatefulSet' | 'Job';

export interface BasePod {
  id: number;
  uid: string;
  name: string;
  spec_hash: string;
  started_at: Date;
  gone_at: Date;
  container_set: NestedContainer[];
};

export interface NestedPod extends BasePod {
};

export interface BaseContainer {
  id: number;
  name: string;
  runtime_id: string;
  started_at: Date;
  finished_at?: Date;
  memory_limit_mi: number|null;
  cpu_request_m: number|null;
  oomevent_set: NestedOOMEvent[];
  resource_usage_buckets?: ResourceUsageBucket[];
};

export interface NestedContainer extends BaseContainer {
};

export interface BaseOOMEvent {
  id: number;
  happened_at: Date;
  is_critical: boolean;
  is_ignored: boolean;
};

export interface NestedOOMEvent extends BaseOOMEvent {
};

export type ResourceUsageBucket = [Date, number, number];  // ts, memory_mi, cpu_m

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

export interface NewAdjustment {
  workload: number;
  scheduled_for: Date;
  containers: ContainerAdjustment[];
}

export interface Adjustment extends NewAdjustment {
  id: number;
  result: OperationResult|null;
}

export interface ContainerAdjustment {
  container_name: string;
  new_memory_limit_mi: number|null;
  new_cpu_request_m: number|null;
}

export interface OperationResult {
  id: number;
  finished_at: Date;
  data: unknown;
  error: unknown;
}
