'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log('ProtectedRoute render state:', { user, isLoading });

  // Immediately redirect to login if we know there's no user
  // This is more direct than waiting for the useEffect
  if (!isLoading && !user) {
    console.log('No user detected, redirecting to login immediately');
    // Use window.location for a hard redirect to break any potential loops
    window.location.href = '/login';
    return null;
  }

  if (isLoading) {
    console.log('Auth loading state, showing loading screen');
    return <LoadingScreen />;
  }

  if (!user) {
    console.log('No user yet, waiting for auth to complete');
    return <LoadingScreen />;
  }

  console.log('User authenticated, showing protected content');
  return <>{children}</>;
}