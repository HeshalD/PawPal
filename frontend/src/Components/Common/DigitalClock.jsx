import React, { useEffect, useState } from "react";

function DigitalClock({ className = "" }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return (
    <div
      className={
        "px-3 py-1 rounded-lg bg-purple-600/90 text-white font-mono text-sm tracking-widest shadow-lg border border-purple-300/50 " +
        className
      }
    >
      {hh}:{mm}:{ss}
    </div>
  );
}

export default DigitalClock;
