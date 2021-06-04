import React from 'react';
import { Workload } from 'types';
import styles from './Editor.module.css'
import Overlay from './Overlay';

interface EditorProps {
  workload: Workload;
  onDone?: () => void;
};

export default function Editor(props: EditorProps) {
  if (!props.workload.summary_set) {
    return null;
  }

  return (
    <Overlay>
      <div className={styles.modal}>
        <h2>
          <code>
            {props.workload.kind}<br/>
            {props.workload.namespace}/{props.workload.name}
          </code>
        </h2>
        <div className={styles.group}>
          {props.workload.summary_set.map(s => (
            <div key={s.container_name}>
              <h3>{s.container_name}</h3>
              <div>
                <label><code>MEM</code> <input type="number" value={s.memory_limit_mi || undefined} /> Mi</label>
                {' '}
                <button>(none)</button>
                {s.memory_limit_mi && (
                  <>
                    {' '}
                    <button>{s.memory_limit_mi} (cur)</button>
                  </>
                )}
                {s.suggestion?.new_memory_limit_mi && (
                  <>
                    {' '}
                    <button>{s.suggestion.new_memory_limit_mi} (sug)</button>
                  </>
                )}
              </div>
              <div>
                <label><code>CPU</code> <input type="number" value={s.cpu_request_m || undefined} /> m</label>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.group}>
          <label>When <input type="date" /> <input type="time" /></label>
          {' '}
          <button>(now)</button>
          {' '}
          <button>(tonight)</button>
        </div>
        <div className={styles.actions}>
          <button onClick={() => props.onDone && props.onDone()}>OK</button>
        </div>
      </div>
    </Overlay>
  );
};
