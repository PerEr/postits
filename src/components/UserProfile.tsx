'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/UserProfile.module.css';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  if (!user) return null;
  
  // Get first letter of email for avatar
  const avatarLetter = user.email ? user.email[0].toUpperCase() : '?';
  
  return (
    <div className={styles.container}>
      <button 
        className={styles.profileButton} 
        onClick={toggleDropdown}
        aria-label="User profile"
        title={`Signed in as ${user.email}`}
      >
        <div className={styles.avatar}>
          {avatarLetter}
        </div>
      </button>
      
      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <strong>{user.email}</strong>
          </div>
          <button 
            className={styles.signOutButton}
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}