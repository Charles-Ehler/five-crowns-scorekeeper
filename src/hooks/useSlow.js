import { useEffect, useState } from 'react';

// True once `active` has stayed true for `ms`, so a loading screen can say
// it's taking a while (and offer a retry) instead of sitting blank.
export function useSlow(active, ms = 5000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    if (!active) return undefined;
    const id = setTimeout(() => setSlow(true), ms);
    return () => clearTimeout(id);
  }, [active, ms]);
  return slow;
}
