import React from 'react';
import styles from '../styles/LoadingScreen.module.css';

export function LoadingScreen() {
  return (
    <div className={styles.loading}>Loading notes...</div>
  );
}