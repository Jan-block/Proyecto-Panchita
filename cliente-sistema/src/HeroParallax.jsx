import { useEffect, useRef, useState } from "react";
import "./HeroParallax.css";

// 1. Recibimos la propiedad en los argumentos de la función
export default function HeroParallax({ onReservarClick }) {
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const imagenesCarrusel = ["/panchi.webp", "/comida.jpg", "/mira.jpg"];

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const timerCarrusel = setInterval(() => {
      setCurrentImgIndex((prevIndex) => 
        prevIndex === imagenesCarrusel.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timerCarrusel);
  }, [imagenesCarrusel.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bgTranslate = scrollY * 0.4;
  const textTranslate = scrollY * 0.15;
  const textOpacity = Math.max(0, 1 - scrollY / 400);

  return (
    <div className="hero-parallax-wrapper" ref={heroRef}>

      <div className="parallax-bg" style={{ transform: `translate3d(0, ${bgTranslate}px, 0)` }}>
        {imagenesCarrusel.map((img, index) => (
          <div
            key={index}
            className={`carrusel-slide-bg ${index === currentImgIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="vignette" />
        <div className="glow-accent" />
        <div className="deco-line-h top" />
        <div className="deco-line-h bottom" />
      </div>

      <div className="particles-layer" style={{ transform: `translate3d(0, ${scrollY * 0.2}px, 0)` }}>
        {[...Array(18)].map((_, i) => (
          <span key={i} className={`particle p-${i}`} />
        ))}
      </div>

      <div
        className={`hero-content ${loaded ? "is-loaded" : ""}`}
        style={{
          transform: `translate3d(0, ${textTranslate}px, 0)`,
          opacity: textOpacity,
        }}
      >
        <div className="deco-ornament">
          <span className="orn-line" />
          <span className="orn-diamond" />
          <span className="orn-line" />
        </div>

        <p className="hero-tagline">DESDE PIURA, PERÚ</p>

        <h1 className="hero-title">
          <span className="title-main">PANCHITA</span>
        </h1>

        <p className="hero-subtitle">Cocina Criolla &amp; Tradición</p>

        <div className="deco-ornament">
          <span className="orn-line" />
          <span className="orn-diamond" />
          <span className="orn-line" />
        </div>

        <div className="hero-actions">
          <button className="btn-hero-primary">Ver nuestra carta</button>
          
          {/* 2. Añadimos el evento onClick para cambiar de página */}
          <button className="btn-hero-ghost" onClick={onReservarClick}>
            Reservar mesa
          </button>
        </div>
      </div>

      <div className="scroll-indicator" style={{ opacity: textOpacity }}>
        <span className="scroll-text">Desliza</span>
        <span className="scroll-arrow" />
      </div>

    </div>
  );
}
