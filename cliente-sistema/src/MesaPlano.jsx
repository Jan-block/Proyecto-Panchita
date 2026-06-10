import React from 'react';
import mesa1 from './assets/mesa.webp';

const IMAGEN_DEFAULT = mesa1;

export function MesaPlano({ mesa, onClick, imagenUrl }) {
  // Normalizar el estado que viene de la base de datos
  const estado = mesa.estado === 'ocupada'   ? 'ocupada'
    : mesa.estado === 'reservada' ? 'reservada'
    : 'disponible';

  // Texto amigable para el usuario
  const textoEstado = estado === 'ocupada'   ? 'Ocupada'
    : estado === 'reservada' ? 'Reservada'
    : 'Libre';

  // Determinar la fuente de la imagen
  const src = imagenUrl || mesa.imagenUrl || IMAGEN_DEFAULT;

  return (
    <button
      className={`mesa-card mesa-card--${estado}`}
      onClick={() => onClick && onClick(mesa.id, mesa.estado)}
      aria-label={`Mesa ${mesa.numero}, ${textoEstado}`}
      title={`Mesa ${mesa.numero} · ${mesa.capacidad} personas · ${textoEstado}`}
    >
      {/* SECCIÓN DE LA IMAGEN */}
      <div className="mesa-card__img-wrap">
        <img
          src={src}
          alt={`Mesa ${mesa.numero}`}
          className="mesa-card__img"
          onError={(e) => { e.currentTarget.src = IMAGEN_DEFAULT; }}
        />
        <div className="mesa-card__overlay" />
      </div>

      {/* FOOTER OPTIMIZADO EN DOS FILAS */}
      <div className="mesa-card__footer">
        
        {/* Fila 1: Datos de identificación (Izquierda y Derecha) */}
        <div className="mesa-card__row-superior">
          <span className="mesa-card__numero">M-{mesa.numero}</span>
          <span className="mesa-card__capacidad">{mesa.capacidad} pers.</span>
        </div>
        
        {/* Fila 2: Badge de Estado Operativo (Ancho completo) */}
        <div className="mesa-card__row-inferior">
          <span className={`mesa-card__badge mesa-card__badge--${estado}`}>
            {textoEstado}
          </span>
        </div>

      </div>
    </button>
  );
}