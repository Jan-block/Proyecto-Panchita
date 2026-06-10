import { useEffect, useState } from "react";
import "./SplashScreen.css";

export default function SplashScreen({ onFinish }) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    // Inicia la transición de desvanecimiento en CSS
    const fadeTimer = setTimeout(() => setSaliendo(true), 1400);
    // Notifica al componente padre para cambiar de vista
    const doneTimer = setTimeout(() => onFinish(), 2000);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]); // Agregado onFinish al array de dependencias por buena práctica de React

  return (
    <div className={`splash-wrapper ${saliendo ? "splash-saliendo" : ""}`}>
      <div className="splash-bg" />
      <div className="splash-deco-line top" />
      <div className="splash-deco-line bottom" />

      <div className="splash-content">
        <div className="splash-logo-ring">
          {/* SVG del Spinner con namespace correcto */}
          <svg className="splash-spinner" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" />
          </svg>

          <div className="splash-cutlery">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
              {/* Tenedor optimizado y unificado en la base */}
              <line x1="18" y1="8" x2="18" y2="24" stroke="#f5ecd7" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="13" y1="8" x2="13" y2="18" stroke="#f5ecd7" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="23" y1="8" x2="23" y2="18" stroke="#f5ecd7" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M13 18 C13 23 23 23 23 18" stroke="#f5ecd7" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <line x1="18" y1="22" x2="18" y2="56" stroke="#f5ecd7" strokeWidth="2.5" strokeLinecap="round"/>

              {/* Cuchillo */}
              <path d="M46 8 C46 8 50 14 50 22 C50 27 47 29 46 30" stroke="#f5ecd7" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <line x1="46" y1="30" x2="46" y2="56" stroke="#f5ecd7" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 className="splash-title">PANCHITA</h1>
        <p className="splash-subtitle">Cocina Criolla & Tradición</p>

        <div className="splash-ornament">
          <span className="orn-line" />
          <span className="orn-diamond" />
          <span className="orn-line" />
        </div>

        <p className="splash-tagline">Preparando tu experiencia...</p>
      </div>
    </div>
  );
}
