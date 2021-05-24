import React from "react";

interface ErrorDetailProps {
  error: any;
}

export default function ErrorDetail(props: ErrorDetailProps) {
  return <div>Error: {props.error}</div>;
}
