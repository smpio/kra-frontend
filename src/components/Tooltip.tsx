import React from 'react';
import styles from './Tooltip.module.css'

interface ModalProps {
  children: React.ReactNode;
  content: React.ReactNode;
};

export default function Tooltip(props: ModalProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <span className={styles.target} onPointerEnter={() => setVisible(true)} onPointerLeave={() => setVisible(false)}>
      {visible && (
        <div className={styles.tooltip}>
          {props.content}
        </div>
      )}

      {props.children}
    </span>
  );
};
