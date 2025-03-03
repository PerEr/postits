'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  console.log('Login page render - Auth state:', { user, authLoading });
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User already logged in, redirecting to home');
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error, data } = await signUp(email, password);
        if (error) throw error;
        
        if (data?.user) {
          alert('Check your email for the confirmation link.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        router.push('/');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>PostIt Notes App</h1>
        <h2 className={styles.subtitle}>{isSignUp ? 'Create Account' : 'Login'}</h2>
        <p className={styles.description}>
          {isSignUp 
            ? 'Create your personal account to save and organize your notes.' 
            : 'Sign in to access your personal notes.'}
        </p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        {/* Fix by adding autocomplete="off" to prevent browser interference */}
        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={styles.input}
              style={{ pointerEvents: 'auto', opacity: 1 }}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={styles.input}
              style={{ pointerEvents: 'auto', opacity: 1 }}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <p className={styles.toggle}>
          {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className={styles.toggleButton}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}