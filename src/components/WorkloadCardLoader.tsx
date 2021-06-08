import React from 'react';
import {Workload} from 'types';
import { useInView } from 'react-intersection-observer';
import { useWorkload } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';
import WorkloadCard from './WorkloadCard';
import styles from './WorkloadCardLoader.module.css';

interface WorkloadCardLoaderProps {
  workloadId: number;
  workload?: Workload;
};

export default function WorkloadCardLoader(props: WorkloadCardLoaderProps) {
  const {ref, inView} = useInView();
  const workloadQuery = useWorkload(props.workloadId, {
    summary: true,
    adjustments: true,
    stats: true,
    step: 5434,   // TODO: calc from width
  }, {
    enabled: inView,
    placeholderData: props.workload,
  });

  return (
    <div ref={ref} className={styles.loader}>
      {workloadQuery.isLoading && <LoadingIndicator />}
      {workloadQuery.error && <ErrorDetail error={workloadQuery.error} />}
      {workloadQuery.data && <WorkloadCard workload={workloadQuery.data} />}
    </div>
  );
}
