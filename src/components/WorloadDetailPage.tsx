import React from 'react';
import WorkloadCardLoader from './WorkloadCard';
import {useParams} from "react-router-dom";
import { useWorkload } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';

interface PageParams {
  id: string;
};

export default function WorkloadDetailPage() {
  let {id} = useParams<PageParams>();
  const {isLoading, error, data} = useWorkload(parseInt(id), {
    summary: true,
  });

  return (
    <div>
      {isLoading && <LoadingIndicator />}
      {error && <ErrorDetail error={error} />}
      {data && <WorkloadCardLoader workload={data} />}
    </div>
  );
}
