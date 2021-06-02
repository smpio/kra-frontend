import {ContainerStats, BaseSummary, BaseSuggestion} from 'types';
import MemoryChart from './MemoryChart';
import CPUChart from './CPUChart';
import styles from './ContainerCard.module.css';
import React from 'react';

interface ContainerCardProps {
  name: string;
  stats: ContainerStats;
  summary: BaseSummary;
  suggestion?: BaseSuggestion;
};

export default function ContainerCard(props: ContainerCardProps) {
  let usage = props.stats.usage;
  let mem = null;
  let cpu = null;

  if (usage.length > 0) {
    mem = {
      max: props.summary.max_memory_mi,
      mean: props.summary.avg_memory_mi,
      stdDev: props.summary.stddev_memory_mi,
      stdDevPercent: 0,
      limit: props.summary.memory_limit_mi,
    };

    mem.stdDevPercent = mem.stdDev / mem.mean * 100;

    cpu = {
      max: props.summary.max_cpu_m,
      mean: props.summary.avg_cpu_m,
      stdDev: props.summary.stddev_cpu_m,
      stdDevPercent: 0,
      request: props.summary.cpu_request_m,
    };

    cpu.stdDevPercent = cpu.stdDev / cpu.mean * 100;
  }

  return (
    <div>
      <h3><code>{props.name}</code></h3>
      <div className={styles.grid}>
        <MemoryChart stats={props.stats} className={styles.chart} />
        <CPUChart stats={props.stats} className={styles.chart} />
        <div>
          {mem && (
            <div>
              {mem.max} {mem.limit && <span className={styles.limit}>/ {mem.limit}</span>} Mi,
              mean: {mem.mean} Mi, stdDev: {mem.stdDev} Mi ({mem.stdDevPercent.toFixed(2)}%)
            </div>
          )}
          {props.suggestion?.new_memory_limit_mi && (
            <>
              <b>Suggestion</b> (priority {props.suggestion.priority}):<br/>
              set memory limit to {props.suggestion.new_memory_limit_mi} Mi
              (current: {props.summary.memory_limit_mi || 'not set'})
              <br/>
              {props.suggestion.memory_reason}
            </>
          )}
        </div>
        <div>
          {cpu && (
            <div>
              {cpu.max} {cpu.request && <span className={styles.limit}>/ {cpu.request}</span>} m,
              mean: {cpu.mean} m, stdDev: {cpu.stdDev} m ({cpu.stdDevPercent.toFixed(2)}%)
            </div>
          )}
          {props.suggestion?.new_cpu_request_m && (
            <>
              <b>Suggestion</b> (priority {props.suggestion.priority}):<br/>
              set CPU request to {props.suggestion.new_cpu_request_m}m
              (current: {props.summary.cpu_request_m || 'not set'})
              <br/>
              {props.suggestion.cpu_reason}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ContainerCard.getStatsSteps = (cardWidth: number) => {
  let chartWidth = cardWidth / 2;
  let chartMargins = 70;
  return chartWidth - chartMargins;
};
