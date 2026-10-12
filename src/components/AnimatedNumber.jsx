import { useEffect, useRef, useState } from 'react';

// Rolls from the previous value to the new one, so totals visibly "count up"
// when a round lands. Interrupting mid-roll continues from wherever it is.
export default function AnimatedNumber({ value, duration = 550 }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = value;
      setShown(value);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(from + (value - from) * eased);
      fromRef.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className="tabular-nums">{shown}</span>;
}
