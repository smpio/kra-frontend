import React from 'react';
import WorkloadCard from './WorkloadCard';
import {useParams} from "react-router-dom";
import { useWorkload } from 'hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorDetail from './ErrorDetail';

interface PageParams {
  id: string;
};

export default function WorkloadDetailPage() {
  let {id} = useParams<PageParams>();
  const {isLoading, error, data} = useWorkload(parseInt(id));

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDetail error={error} />;
  }

  if (!data) {
    return null;
  }

  return <WorkloadCard workload={data} />;
}
