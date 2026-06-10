import React, { useState, useEffect } from 'react';
import './GestionMesas.css';
import { MesaPlano } from './MesaPlano';
import './MesaPlano.css';

export default function GestionMesas() {
  const [salas, setSalas] = useState([]);
  const [nuevaSala, setNuevaSala] = useState({ nombre: '', capacidadTotal: 50, descripcion: '' });
  const [mensajeSala, setMensajeSala] = useState({ texto: '', tipo: '' });

  // --- ESTADOS PARA LAS MESAS OPERATIVAS ---
  const [mesasAdmin, setMesasAdmin] = useState([]);
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [nuevaMesa, setNuevaMesa] = useState({ salaId: '', numero: '', capacidad: 4, ubicacion: '' });
  const [mensajeMesa, setMensajeMesa] = useState({ texto: '', tipo: '' });
  const [guardandoMesa, setGuardandoMesa] = useState(false);

  // Carga e inicializa la información consultando a la API
  const cargarInfraestructura = () => {
        // 1. Obtener salas de la base de datos de forma ultra segura
    fetch('http://localhost:8080/api/salas')
      .then(res => {
        if (!res.ok) throw new Error('Ruta no encontrada o error en servidor');
        return res.json();
      })
      .then(data => {
        // 🌟 PROTECCIÓN: Nos aseguramos de que siempre sea una lista [] para que no rompa el .map()
        const salasArreglo = Array.isArray(data) ? data : [];
        setSalas(salasArreglo);
        
        // 🌟 CORRECCIÓN DE ÍNDICE: Asignamos el ID de la primera sala encontrada de forma correcta
        if (salasArreglo.length > 0) {
          setNuevaMesa(prev => ({ ...prev, salaId: salasArreglo[0].id }));
        }
      })
      .catch(err => {
        console.error("Error al recuperar las salas, protegiendo interfaz:", err);
        setSalas([]); // 👈 Esto evita la pantalla negra si el backend responde mal
      });

    // 2. Obtener mesas de la base de datos
    setCargandoMesas(true);
    fetch('http://localhost:8080/api/mesas')
      .then(res => res.json())
      .then(data => {
        setMesasAdmin(data);
        setCargandoMesas(false);
      })
      .catch(err => {
        console.error("Error al recuperar las mesas:", err);
        setCargandoMesas(false);
      });
  };

  useEffect(() => {
    cargarInfraestructura();
  }, []);

  // 🚀 CREAR NUEVA SALA (POST)
  const procesarRegistroSala = (e) => {
    e.preventDefault();
    if (!nuevaSala.nombre.trim()) {
      setMensajeSala({ texto: 'El nombre de la sala es obligatorio.', tipo: 'error' });
      return;
    }

    fetch('http://localhost:8080/api/salas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nuevaSala.nombre,
        capacidadTotal: Number(nuevaSala.capacidadTotal),
        estado: 'activo',
        descripcion: nuevaSala.descripcion
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Error en el servidor');
      return res.json();
    })
    .then(data => {
      setMensajeSala({ texto: `¡Área "${data.nombre}" inaugurada correctamente desde la web!`, tipo: 'exito' });
      setNuevaSala({ nombre: '', capacidadTotal: 50, descripcion: '' });
      cargarInfraestructura(); // Recarga para que la sala aparezca abajo en el selector
    })
    .catch(() => setMensajeSala({ texto: 'Error de comunicación al intentar crear la sala.', tipo: 'error' }));
  };

  // 🪑 CREAR NUEVA MESA (POST - Sincronizado perfectamente con tu Integer salaId de Java)
  const procesarRegistroMesa = (e) => {
    e.preventDefault();
    if (!nuevaMesa.numero.trim() || !nuevaMesa.salaId) {
      setMensajeMesa({ texto: 'Por favor, ingresa el identificador y selecciona una sala.', tipo: 'error' });
      return;
    }

    setGuardandoMesa(true);
    setMensajeMesa({ texto: '', tipo: '' });

    // 🌟 CORRECCIÓN EXACTA: Enviamos la propiedad salaId plana de forma entera para tu backend
    const payloadMesa = {
      salaId: Number(nuevaMesa.salaId), // Hace match con tu "private Integer salaId" de Mesa.java
      numero: nuevaMesa.numero,
      capacidad: Number(nuevaMesa.capacidad),
      estado: 'disponible',
      ubicacion: nuevaMesa.ubicacion
    };

    fetch('http://localhost:8080/api/mesas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadMesa)
    })
    .then(res => {
      if (!res.ok) throw new Error('Fallo del servidor relacional');
      return res.json();
    })
    .then(data => {
      setMensajeMesa({ texto: `¡Mesa ${data.numero} instalada con éxito en el sistema!`, tipo: 'exito' });
      setNuevaMesa(prev => ({ ...prev, numero: '', ubicacion: '' })); // Limpia campos de texto
      setGuardandoMesa(false);
      cargarInfraestructura(); // Dibuja el círculo en la pantalla
    })
    .catch(() => {
      setMensajeMesa({ texto: 'Fallo al guardar la mesa. Verifica las llaves foráneas de la base de datos.', tipo: 'error' });
      setGuardandoMesa(false);
    });
  };

  const alternarEstadoMesa = (mesaId, estadoActual) => {
    let siguienteEstado = 'disponible';
    if (estadoActual === 'disponible') siguienteEstado = 'ocupada';
    else if (estadoActual === 'ocupada') siguienteEstado = 'reservada';

    fetch(`http://localhost:8080/api/mesas/${mesaId}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: siguienteEstado })
    })
    .then(res => res.json())
    .then(() => cargarInfraestructura())
    .catch(err => console.error(err));
  };
  return (
    <div className="management-box-view">
      <div className="view-header">
        <h1>Infraestructura y Configuración del Local</h1>
        <p>Registra las áreas de tu restaurante y gestiona el estado operativo de las mesas desde una interfaz unificada.</p>
      </div>

      {/* 🌟 FORMULARIO SUPERIOR: INTERFAZ WEB PROFESIONAL PARA CREAR SALAS */}
      <div className="form-container-premium" style={{ maxWidth: '100%', marginBottom: '25px' }}>
        <h3>🏗️ Registrar Nueva Área / Sala del Restaurante</h3>
        <form onSubmit={procesarRegistroSala} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {mensajeSala.texto && (
            <div className={`form-alert-message ${mensajeSala.tipo}`} style={{ width: '100%', padding: '10px' }}>
              {mensajeSala.texto}
            </div>
          )}
          
          <div style={{ flex: '1', minWidth: '180px' }} className="premium-admin-form">
            <label>Nombre de la Sala / Zona:</label>
            <input 
              type="text" 
              value={nuevaSala.nombre} 
              onChange={e => setNuevaSala({...nuevaSala, nombre: e.target.value})} 
              placeholder="Ej: Salón Principal, Terraza, VIP" 
            />
          </div>
          
          <div style={{ width: '130px' }} className="premium-admin-form">
            <label>Capacidad Total:</label>
            <input 
              type="number" 
              value={nuevaSala.capacidadTotal} 
              onChange={e => setNuevaSala({...nuevaSala, capacidadTotal: e.target.value})} 
            />
          </div>
          
          <div style={{ flex: '1.5', minWidth: '200px' }} className="premium-admin-form">
            <label>Descripción / Características:</label>
            <input 
              type="text" 
              value={nuevaSala.descripcion} 
              onChange={e => setNuevaSala({...nuevaSala, descripcion: e.target.value})} 
              placeholder="Ej: Zona familiar con aire acondicionado" 
            />
          </div>
          
          <button type="submit" className="btn-submit-premium" style={{ width: 'auto', padding: '12px 25px', margin: '0' }}>
            ➕ Crear Sala
          </button>
        </form>
      </div>

      {/* SECCIÓN INFERIOR DE DOBLE LAYOUT */}
      <div className="dashboard-double-layout">
        
        {/* COLUMNA IZQUIERDA: EL MAPA EN VIVO DEL SALÓN */}
        <div className="analytics-main-box" style={{ flex: '1.2' }}>
          <h3>Mapa Operativo del Salón</h3>
          <p className="instruction-text" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
            Haz clic sobre cualquier círculo para alternar su estado operacional (Libre 🟢 ➔ Ocupada 🔴 ➔ Reservada 🟡).
          </p>
          
          <div className="mesas-operativas-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '20px', width: '100%', marginTop: '15px' }}>
            {cargandoMesas ? (
              <div style={{ color: '#64748b' }}>Consultando distribución con el servidor...</div>
            ) : mesasAdmin.length === 0 ? (
              <div style={{ gridColumn: '1/-1', padding: '25px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', textAlign: 'center' }}>
                No hay mobiliario registrado en la base de datos. Utiliza el panel superior para crear un área y luego añade tus mesas.
              </div>
            ) : (
              mesasAdmin.map((mesa) => (
  <MesaPlano
    key={mesa.id}
    mesa={mesa}
    onClick={alternarEstadoMesa}
  />
))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO DE INSTALACIÓN DE MESAS CON CONTROL RELACIONAL REAL */}
        <div className="form-container-premium" style={{ flex: '1', marginTop: '0' }}>
          <h3>🪑 Instalar Nueva Mesa</h3>
          <form onSubmit={procesarRegistroMesa} className="premium-admin-form">
            {mensajeMesa.texto && (
              <div className={`form-alert-message ${mensajeMesa.tipo}`}>
                {mensajeMesa.texto}
              </div>
            )}
            
            <div className="form-group-row">
              <label>Seleccionar Área de Destino (Cargadas de la BD):</label>
              <select 
                name="salaId" 
                value={nuevaMesa.salaId} 
                onChange={e => setNuevaMesa({...nuevaMesa, salaId: e.target.value})}
              >
                {salas.length === 0 ? (
                  <option value="">⚠️ Registra primero una sala en el formulario superior</option>
                ) : (
                  salas.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (ID: {s.id})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group-row">
              <label>Código o Número de Mesa:</label>
              <input 
                type="text" 
                value={nuevaMesa.numero} 
                onChange={e => setNuevaMesa({...nuevaMesa, numero: e.target.value})} 
                placeholder="Ej: 02" 
                maxLength={10} 
              />
            </div>

            <div className="form-group-row">
              <label>Capacidad Máxima de Comensales:</label>
              <select 
                value={nuevaMesa.capacidad} 
                onChange={e => setNuevaMesa({...nuevaMesa, capacidad: Number(e.target.value)})}
              >
                <option value={2}>2 Personas (Mesa Pequeña)</option>
                <option value={4}>4 Personas (Mesa Mediana)</option>
                <option value={6}>6 Personas (Mesa Familiar)</option>
              </select>
            </div>

            <div className="form-group-row">
              <label>Ubicación Específica (Opcional):</label>
              <input 
                type="text" 
                value={nuevaMesa.ubicacion} 
                onChange={e => setNuevaMesa({...nuevaMesa, ubicacion: e.target.value})} 
                placeholder="Ej: Junto a la ventana principal" 
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit-premium" 
              disabled={guardandoMesa || salas.length === 0}
            >
              {guardandoMesa ? 'Procesando en MySQL...' : '➕ Dar de Alta Mesa'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
