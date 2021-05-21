import React from 'react';
import * as API from 'api';
import {Workload} from 'types';
import WorkloadCard from './WorkloadCard';
import {useParams} from "react-router-dom";

interface PageParams {
  id: string;
};

export default function WorkloadDetailPage() {
  let {id} = useParams<PageParams>();
  const [workload, setWorkload] = React.useState<Workload>();

  React.useEffect(() => {
    (async () => {
      let workload = await API.getWorkload(parseInt(id));
      setWorkload(workload);
    })();
  }, [id]);

  return (
    <div>
      {workload && <WorkloadCard workload={workload} />}
    </div>
  );
}
