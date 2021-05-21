import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import styles from './App.module.css';
import WorkloadDetailPage from './WorloadDetailPage';
import WorkloadListPage from './WorloadListPage';

export default function App() {
  return (
    <Router>
      <div className={styles.container}>
        <Switch>
          <Route path="/workload/:id">
            <WorkloadDetailPage />
          </Route>
          <Route path="/">
            <WorkloadListPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
