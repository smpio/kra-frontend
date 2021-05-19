import React from 'react';
import * as d3 from 'd3';

type RenderFunc = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, size: Size) => void;
interface Size {
  width: number;
  height: number;
}

export function useD3(renderFunc: RenderFunc, dependencies: React.DependencyList) {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    let svg = d3.select(ref.current);
    let width = ref.current.clientWidth;
    let height = ref.current.clientHeight;

    svg.selectChildren('*').remove();

    renderFunc(svg, {width, height});
  }, dependencies);  // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
};
