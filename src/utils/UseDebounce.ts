import { useState, useEffect, useCallback } from "react";

const UseDebounce = (callback: () => void, delay: number) => {
  const [timer, setTimer] = useState<number | null>(null);

  const debouncedCallback = useCallback(() => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
    const newTimer = window.setTimeout(callback, delay);
    setTimer(newTimer);
  }, [callback, delay, timer]);

  useEffect(() => {
    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [timer]);

  return debouncedCallback;
};

export default UseDebounce;
