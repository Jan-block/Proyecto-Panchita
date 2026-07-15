import React, { useEffect, useState } from 'react';
import './InicioRestaurante.css';
import logoPanchita from './assets/panchita.png'; 
import HeroParallax from './HeroParallax';
import imgTradicion from './assets/tradicion.jpg';
import FormularioReserva from './FormularioReserva'; ;
import NuestraCarta from './NuestraCarta.jsx';


export default function InicioRestaurante({ usuarioLogueado, onLogout }) {
  
  const [seccionActiva, setSeccionActiva] = useState('portada');

  useEffect(() => {
    if (seccionActiva !== 'portada') return;

    const elementos = document.querySelectorAll('.seccion-introduccion-animada');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('activo');
          } else {
            entry.target.classList.remove('activo');
          }
        });
      },
      { 
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    elementos.forEach(el => observer.observe(el));
    
    return () => {
      elementos.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [seccionActiva]); 

  return (
    <div className="landing-container">

      {/* ── 1. TOPBAR ── */}
      <div className="topbar-restaurante">
        <div className="topbar-left">
          <span>📞 ¡Llámenos hoy! al +51 987 654 321</span>
          <span className="separator">|</span>
          <span>✉️ administracion@panchita.pe</span>
        </div>
        <div className="topbar-right">
          <ul className="social-wrapper">
            <li className="social-icon facebook">
              <span className="social-tooltip">Facebook</span>
              <svg viewBox="0 0 320 512" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
              </svg>
            </li>
            <li className="social-icon instagram">
              <span className="social-tooltip">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
              </svg>
            </li>
          </ul>
        </div>
      </div>

      {/* ── 2. NAVBAR ── */}
      <nav className="navbar-flotante">
        <div className="logo-contenedor-flotante" onClick={() => setSeccionActiva('portada')} style={{ cursor: 'pointer' }}>
          <img src={logoPanchita} alt="Logo Panchita" className="logo-flotante-img" />
        </div>
        <ul className="nav-links-restaurante">
          <li onClick={() => setSeccionActiva('portada')} style={{ cursor: 'pointer' }}>INICIO</li>
          <li onClick={() => setSeccionActiva('carta')}>NUESTRA CARTA ▾</li>
          <li>TE BRINDAMOS</li>
          <li>GALERÍA</li>
          <li>NUESTRA HISTORIA</li>
          <li className="btn-reserva-nav" onClick={() => setSeccionActiva('reservaciones')}>
            RESERVACIONES
          </li>
        </ul>
        
        <div className="nav-user-dropdown-modern">
          <div className="avatar-trigger-modern">
            
            <span className="avatar-inicial-modern">
              {usuarioLogueado && usuarioLogueado.nombre 
                ? usuarioLogueado.nombre.charAt(0).toUpperCase() 
                : "C"}
            </span>
            <span className="arrow-down-modern">▾</span>
          </div>
          <div className="dropdown-panel-modern">
            <div className="panel-user-header">
              <p className="panel-greet">Bienvenido de vuelta,</p>
             
              <h4 className="panel-name">
                {usuarioLogueado && usuarioLogueado.nombre 
                  ? usuarioLogueado.nombre 
                  : "Cliente"}
              </h4>
            </div>
            <div className="panel-divider-modern" />
            <ul className="panel-menu-list">
              <li>📋 Mis Pedidos</li>
              <li onClick={() => setSeccionActiva('reservaciones')}>📅 Mis Reservas</li>
              <li className="logout-item-modern" onClick={onLogout}>
                🚪 Cerrar Sesión
              </li>
            </ul>
          </div>
        </div>
      </nav>

     
      {seccionActiva === 'portada' ? (
        <>
          <div className="hero-main-wrapper-scroll">
            <HeroParallax onReservarClick={() => setSeccionActiva('reservaciones')} />

            {/* ── BANNER DE HORARIOS ── */}
            <div className="banner-horarios-inferior">
              <div className="sello-recomendacion">
                <div className="sello-circulo">
                  <span className="estrella">⭐</span>
                  <p>RECOMENDADO</p>
                  <p className="año-sello">2026</p>
                </div>
              </div>
              <div className="bloque-horarios-centro">
                <h3>Nuestro horario de atención</h3>
                <div className="horarios-flex">
                  <div className="horario-item">
                    <p className="dias-texto">Lunes - Sábado</p>
                    <p className="horas-texto">12:00pm - 10:00pm</p>
                  </div>
                  <div className="horario-item">
                    <p className="dias-texto dias-feriado">Domingo - Feriados</p>
                    <p className="horas-texto">11:30am - 5:00pm</p>
                  </div>
                </div>
              </div>
              <div className="bloque-pedidos-derecha">
                <button className="btn-informes-pedidos">
                  Informes y pedidos <span className="wsp-icon">💬</span>
                </button>
              </div>
            </div>
          </div>

          <section className="seccion-introduccion-animada">
            <div className="intro-contenedor">
              <div className="intro-col-texto parallax-reveal-left">
                <span className="intro-subtitulo">Bienvenidos a Panchita</span>
                <h2 className="intro-titulo">Cocina Criolla con Alma y Tradición</h2>
                <hr className="intro-separador" />
                <p className="intro-descripcion">
                  En cada rincón de nuestros fogones se esconde el secreto de las recetas 
                  de antaño. Llevamos el verdadero sabor criollo a tu mesa, seleccionando 
                  los ingredientes más frescos y rindiendo homenaje a la riqueza culinaria 
                  de nuestra tierra. Aquí, cada plato cuenta una historia.
                </p>
                <button className="btn-conoce-mas">Nuestra Historia ➔</button>
              </div>

              <div className="intro-col-imagen parallax-reveal-right">
                <div className="intro-marco-foto">
                  <img
                    src={imgTradicion}  
                    alt="Experiencia Gastronómica Panchita"
                    className="intro-img-fluida"
                  />
                  <div className="intro-decoracion-borde parallax-sub-layer"></div>
                </div>
              </div>
            </div>
          </section>
        </>
      ): seccionActiva == 'carta'  ? (
        /* VISTA DE NUESTRA CARTA */
        <div>
          <NuestraCarta usuarioLogueado={usuarioLogueado}/>
        </div>
      ) : (
        /* ── VISTA DEDICADA DE RESERVAS ── */
        <div className="seccion-reserva-vistas-pagina" style={{ paddingTop: '140px', paddingBottom: '60px' }}>
          <FormularioReserva 
            usuarioLogueado={usuarioLogueado} 
            alEnviarReserva={(datosForm) => {
              console.log("Listo para procesar en base de datos:", datosForm);
            }} 
          />
        </div>
      )}

    </div>
  );
}