import React from "react";

interface ErrorDetailProps {
  error: any;
}

export default function ErrorDetail(props: ErrorDetailProps) {
  let detail = 'Unknown error';
  if (typeof props.error.toString === 'function') {
    detail = props.error.toString();
  }

  return <div>Error: {detail}</div>;
}
