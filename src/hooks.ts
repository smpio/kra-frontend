import React from 'react';
import * as d3 from 'd3';

type RenderFunc = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void;

export const useD3 = (renderFunc: RenderFunc, dependencies: React.DependencyList) => {
    const ref = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
      if (ref.current) {
        renderFunc(d3.select(ref.current));
        return () => {};
      }
    }, dependencies);  // eslint-disable-line react-hooks/exhaustive-deps

    return ref;
};
