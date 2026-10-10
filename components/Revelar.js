"use client";

import { useEffect, useRef } from "react";

// Aparece con una animación suave cuando entra en pantalla.
export default function Revelar({ children, className = "", retraso = 0, as: Etiqueta = "div" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add("visible");
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Etiqueta ref={ref} className={`reveal-item ${className}`} style={retraso ? { animationDelay: `${retraso}ms` } : undefined}>
      {children}
    </Etiqueta>
  );
}
