import React, { useState, useEffect, useCallback } from 'react';
import './GestionEstacionamiento.css';
import { apiFetch } from './api';

const ESTADOS = {
  LIBRE:     { label: 'Libre',     clase: 'espacio-libre',     icono: '🅿️' },
  RESERVADO: { label: 'Reservado', clase: 'espacio-reservado', icono: '🟡' },
  OCUPADO:   { label: 'Ocupado',   clase: 'espacio-ocupado',   icono: '🚗' },
};

const minutosOcupado = (fechaEntrada) => {
  if (!fechaEntrada) return null;
  const diff = Date.now() - new Date(fechaEntrada).getTime();
  return Math.floor(diff / 60000);
};

const TOTAL_ESPACIOS = 20;

export default function GestionEstacionamiento() {
  const [espacios, setEspacios]           = useState([]);
  const [reservas, setReservas]           = useState([]);
  const [filtro, setFiltro]               = useState('TODOS');
  const [espacioActivo, setEspacioActivo] = useState(null);
  const [modalRegistro, setModalRegistro] = useState(null);
  const [cargando, setCargando]           = useState(true);

  const inicializarEspacios = useCallback((reservasData) => {
    // estacionamiento: 0 = libre, 1 = reservado (llegará), 2 = ocupado (ya llegó)
    const reservadas  = reservasData.filter(r => r.estacionamiento === 1);
    const ocupadas    = reservasData.filter(r => r.estacionamiento === 2);

    const nuevosEspacios = Array.from({ length: TOTAL_ESPACIOS }, (_, i) => {
      const ocupado   = ocupadas[i - (reservadas.length > i ? 0 : 0)];
      const reservado = reservadas[i];

      // Primero llenamos ocupados, luego reservados
      const ocup = ocupadas[i] || null;
      const res  = !ocup ? reservadas[i - ocupadas.length] || null : null;

      if (ocup) {
        return {
          id: i + 1, numero: i + 1, estado: 'OCUPADO',
          reservaId: ocup.id, codigoReserva: ocup.codigoReserva,
          cliente: ocup.usuario?.nombre || 'Cliente',
          fechaEntrada: ocup.updatedAt || ocup.createdAt,
        };
      } else if (res) {
        return {
          id: i + 1, numero: i + 1, estado: 'RESERVADO',
          reservaId: res.id, codigoReserva: res.codigoReserva,
          cliente: res.usuario?.nombre || 'Cliente',
          fechaEntrada: null,
        };
      } else {
        return { id: i + 1, numero: i + 1, estado: 'LIBRE', reservaId: null, codigoReserva: null, cliente: null, fechaEntrada: null };
      }
    });

    setEspacios(nuevosEspacios);
    setCargando(false);
  }, []);

  const cargarReservas = useCallback(() => {
    setCargando(true);
    apiFetch('/api/reservas')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setReservas(arr);
        inicializarEspacios(arr);
      })
      .catch(() => { setReservas([]); inicializarEspacios([]); });
  }, [inicializarEspacios]);

  useEffect(() => { cargarReservas(); }, [cargarReservas]);

  const conteo = {
    LIBRE:     espacios.filter(e => e.estado === 'LIBRE').length,
    RESERVADO: espacios.filter(e => e.estado === 'RESERVADO').length,
    OCUPADO:   espacios.filter(e => e.estado === 'OCUPADO').length,
  };

  const espaciosFiltrados = filtro === 'TODOS' ? espacios : espacios.filter(e => e.estado === filtro);

  // Actualizar estacionamiento en backend
  const actualizarEstacionamiento = async (reservaId, valor) => {
    // El endpoint GET individual no existe; buscamos la reserva en la lista completa
    const res = await apiFetch('/api/reservas');
    const todas = await res.json();
    const reserva = todas.find(r => r.id === reservaId);
    if (!reserva) throw new Error('Reserva no encontrada');
    await apiFetch(`/api/reservas/${reservaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reserva, estacionamiento: valor }),
    });
  };

  // Cliente llega → RESERVADO a OCUPADO
  const registrarLlegada = async (espacio) => {
    try {
      await actualizarEstacionamiento(espacio.reservaId, 2);
      setEspacios(prev => prev.map(e =>
        e.id === espacio.id ? { ...e, estado: 'OCUPADO', fechaEntrada: new Date().toISOString() } : e
      ));
      setEspacioActivo(null);
    } catch { alert('No se pudo registrar la llegada.'); }
  };

  // Registrar salida → OCUPADO a LIBRE
  const registrarSalida = async (espacio) => {
    try {
      await actualizarEstacionamiento(espacio.reservaId, 0);
      setEspacios(prev => prev.map(e =>
        e.id === espacio.id ? { ...e, estado: 'LIBRE', reservaId: null, codigoReserva: null, cliente: null, fechaEntrada: null } : e
      ));
      setEspacioActivo(null);
    } catch { alert('No se pudo registrar la salida.'); }
  };

  // Espacio libre sin reserva → OCUPADO directo
  const registrarEntradaSinReserva = async (espacioId, datos) => {
    setEspacios(prev => prev.map(e =>
      e.id === espacioId
        ? { ...e, estado: 'OCUPADO', codigoReserva: null, cliente: datos.cliente || 'Sin reserva', placa: datos.placa, fechaEntrada: new Date().toISOString() }
        : e
    ));
    setModalRegistro(null);
  };

  const reservasLibres = reservas.filter(r => !r.estacionamiento || r.estacionamiento === 0);

  return (
    <div className="estacionamiento-container">
      <div className="estacionamiento-header">
        <div>
          <h1 className="estacionamiento-titulo"> Estacionamiento</h1>
          <p className="estacionamiento-subtitulo">Vista en tiempo real · {TOTAL_ESPACIOS} espacios en total</p>
        </div>
        <button className="btn-refresh" onClick={cargarReservas}>↻ Actualizar</button>
      </div>

      {/* Resumen */}
      <div className="estacionamiento-resumen">
        <div className="resumen-card resumen-libre">
          <span className="resumen-icono">🟢</span>
          <span className="resumen-numero">{conteo.LIBRE}</span>
          <span className="resumen-label">Libres</span>
        </div>
        <div className="resumen-card resumen-reservado">
          <span className="resumen-icono">🟡</span>
          <span className="resumen-numero">{conteo.RESERVADO}</span>
          <span className="resumen-label">Reservados</span>
        </div>
        <div className="resumen-card resumen-ocupado">
          <span className="resumen-icono">🔴</span>
          <span className="resumen-numero">{conteo.OCUPADO}</span>
          <span className="resumen-label">Ocupados</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="estacionamiento-filtros">
        {[
          { key: 'TODOS',     label: 'Todos',      count: espacios.length },
          { key: 'LIBRE',     label: 'Libres',     count: conteo.LIBRE },
          { key: 'RESERVADO', label: 'Reservados', count: conteo.RESERVADO },
          { key: 'OCUPADO',   label: 'Ocupados',   count: conteo.OCUPADO },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            className={`filtro-btn filtro-${key.toLowerCase()} ${filtro === key ? 'activo' : ''}`}
            onClick={() => setFiltro(key)}
          >
            <span className="filtro-dot" />
            {label}
            <span className="filtro-count">{count}</span>
          </button>
        ))}
      </div>

      {/* Mapa */}
      {cargando ? (
        <div className="estacionamiento-cargando">Cargando espacios...</div>
      ) : (
        <div className="espacios-grid">
          {espaciosFiltrados.map((espacio) => {
            const cfg    = ESTADOS[espacio.estado];
            const mins   = minutosOcupado(espacio.fechaEntrada);
            const urgente = espacio.estado === 'OCUPADO' && mins !== null && mins >= 120;

            return (
              <button
                key={espacio.id}
                className={`espacio-card ${cfg.clase} ${urgente ? 'espacio-urgente' : ''}`}
                onClick={() => espacio.estado === 'LIBRE' ? setModalRegistro(espacio) : setEspacioActivo(espacio)}
              >
                <span className="espacio-icono">{cfg.icono}</span>
                <span className="espacio-numero">#{espacio.numero}</span>
                {espacio.codigoReserva && <span className="espacio-codigo">{espacio.codigoReserva}</span>}
                {espacio.cliente && <span className="espacio-cliente">{espacio.cliente}</span>}
                <span className={`espacio-estado-label estado-${espacio.estado.toLowerCase()}`}>{cfg.label}</span>
                {mins !== null && (
                  <span className={`espacio-tiempo ${urgente ? 'tiempo-urgente' : ''}`}>
                    {mins}min {urgente ? '⚠' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {espacioActivo && (
        <ModalDetalle
          espacio={espacioActivo}
          onCerrar={() => setEspacioActivo(null)}
          onLlegada={registrarLlegada}
          onSalida={registrarSalida}
        />
      )}

      {modalRegistro && (
        <ModalEntradaSinReserva
          espacio={modalRegistro}
          onCerrar={() => setModalRegistro(null)}
          onConfirmar={registrarEntradaSinReserva}
        />
      )}
    </div>
  );
}

function ModalDetalle({ espacio, onCerrar, onLlegada, onSalida }) {
  const mins = minutosOcupado(espacio.fechaEntrada);
  const cfg  = ESTADOS[espacio.estado];

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-detalle" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-titulo">Espacio #{espacio.numero}</h2>
            <span className={`modal-estado-badge estado-${espacio.estado.toLowerCase()}`}>
              {cfg.icono} {cfg.label}
            </span>
          </div>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </div>
        <div className="modal-body">
          {espacio.codigoReserva && (
            <div className="modal-fila">
              <span className="modal-campo">Código Reserva</span>
              <span className="modal-valor">{espacio.codigoReserva}</span>
            </div>
          )}
          {espacio.cliente && (
            <div className="modal-fila">
              <span className="modal-campo">Cliente</span>
              <span className="modal-valor">{espacio.cliente}</span>
            </div>
          )}
          {espacio.fechaEntrada && (
            <div className="modal-fila">
              <span className="modal-campo">Hora entrada</span>
              <span className="modal-valor">
                {new Date(espacio.fechaEntrada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {mins !== null && (
            <div className="modal-fila">
              <span className="modal-campo">Tiempo</span>
              <span className={`modal-valor ${mins >= 120 ? 'valor-alerta' : ''}`}>
                {mins} minutos {mins >= 120 ? '⚠ Supera 2h' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="modal-acciones">
          {espacio.estado === 'RESERVADO' && (
            <button className="btn-llegada" onClick={() => onLlegada(espacio)}>
              ✅ Cliente llegó — Registrar entrada
            </button>
          )}
          {espacio.estado === 'OCUPADO' && (
            <button className="btn-salida" onClick={() => onSalida(espacio)}>
              🚗 Registrar Salida
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalEntradaSinReserva({ espacio, onCerrar, onConfirmar }) {
  const [placa, setPlaca]     = useState('');
  const [cliente, setCliente] = useState('');

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-detalle" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-titulo">Espacio #{espacio.numero}</h2>
            <span className="modal-estado-badge estado-libre">🟢 Libre</span>
          </div>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-subtitulo">Cliente sin reserva previa</p>
          <div className="modal-campo-input">
            <label>Placa del vehículo *</label>
            <input type="text" placeholder="Ej: ABC-123" value={placa}
              onChange={e => setPlaca(e.target.value)} className="input-campo" maxLength={8} />
          </div>
          <div className="modal-campo-input">
            <label>Nombre del cliente (opcional)</label>
            <input type="text" placeholder="Ej: Juan Pérez" value={cliente}
              onChange={e => setCliente(e.target.value)} className="input-campo" />
          </div>
          <div className="modal-fila">
            <span className="modal-campo">Hora entrada</span>
            <span className="modal-valor">
              {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="modal-acciones">
          <button className="btn-cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="btn-entrada" onClick={() => {
            if (!placa.trim()) { alert('Ingresa la placa'); return; }
            onConfirmar(espacio.id, { placa: placa.toUpperCase(), cliente });
          }}>
            ✅ Confirmar Entrada
          </button>
        </div>
      </div>
    </div>
  );
}