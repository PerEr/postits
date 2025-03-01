import { useState, useEffect } from 'react';

export function useBrowserDetection() {
  const [isBrowser, setIsBrowser] = useState(false);
  
  // This effect runs once to determine if we're in a browser environment
  // Next.js can run code on the server where localStorage isn't available
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  return isBrowser;
}