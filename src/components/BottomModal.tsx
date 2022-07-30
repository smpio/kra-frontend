import React from 'react';
import styles from './BottomModal.module.css'

interface ModalProps {
  className?: string;
  onCancel?: () => void;
  children?: React.ReactNode;
};

export default function BottomModal(props: ModalProps) {
  return (
    <div className={styles.canvas} onClick={() => props.onCancel && props.onCancel()}>
      <div className={`${styles.modal} ${props.className ?? ''}`} onClick={e => e.stopPropagation()}>
        {props.children}
      </div>
    </div>
  );
};
