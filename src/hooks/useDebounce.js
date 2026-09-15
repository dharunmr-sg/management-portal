import { useState, useEffect } from 'react';

// A custom hook is just a JavaScript function that uses other React hooks!
export default function useDebounce(value, delay) {
  // We keep a separate piece of state for the "delayed" value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 1. Set a timer. Only update the debouncedValue AFTER the delay finishes.
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Cleanup function! If the 'value' changes BEFORE the timer finishes, 
    // React runs this cleanup to destroy the old timer and start a new one.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // This effect runs every time 'value' or 'delay' changes

  return debouncedValue;
}
