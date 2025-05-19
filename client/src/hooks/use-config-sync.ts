import { useEffect, useRef } from 'react';

export function useConfigSync(
  callback: (config: any) => void,
  config: any,
  dependencies: any[]
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastConfigRef = useRef<string>('');

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the callback
    timeoutRef.current = setTimeout(() => {
      const configString = JSON.stringify(config);
      
      // Only call if config has actually changed
      if (configString !== lastConfigRef.current) {
        lastConfigRef.current = configString;
        callback(config);
      }
    }, 100); // 100ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);
}