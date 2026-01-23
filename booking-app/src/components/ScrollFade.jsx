// src/components/ScrollFade.jsx
import { useEffect, useRef } from "react";

export default function ScrollFade({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.target.classList.toggle("opacity-100", entry.isIntersecting);
        entry.target.classList.toggle("translate-y-0", entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-4 transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
}
