import React from 'react';
import WorkloadCardLoader from './WorkloadCardLoader';
import {useParams} from "react-router-dom";

interface PageParams {
  id: string;
};

export default function WorkloadDetailPage() {
  let {id} = useParams<PageParams>();
  return <WorkloadCardLoader workloadId={parseInt(id)} />;
}
