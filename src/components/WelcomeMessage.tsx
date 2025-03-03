'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/WelcomeMessage.module.css';

export function WelcomeMessage() {
  const [visible, setVisible] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    // Check if the welcome message has been shown before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (hasSeenWelcome) {
      setVisible(false);
    }
    
    // Hide the message after 10 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem('hasSeenWelcome', 'true');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };
  
  if (!visible || !user) return null;
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button className={styles.closeButton} onClick={handleClose}>×</button>
        <h2 className={styles.title}>Welcome, {user.email?.split('@')[0]}!</h2>
        <p className={styles.message}>
          Your notes are private and only visible to you. Create multiple boards to organize your thoughts, and drag notes to position them wherever you want.
        </p>
        <p className={styles.message}>
          Click the yellow avatar in the top-right corner to access your profile and sign out.
        </p>
      </div>
    </div>
  );
}