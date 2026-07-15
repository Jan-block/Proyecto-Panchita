import { useState, useEffect, useCallback } from 'react';
import './Adminplatos.css';

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
const FORM_VACIO = { name: '', image: null, imagePreview: null, description: '', price: '', category: '' };

const ESTADOS_PEDIDO = ['Pendiente', 'Preparando', 'En camino', 'Entregado', 'Cancelado'];

const ESTADO_COLOR = {
  Pendiente:  { bg: '#FEF3C7', color: '#92400E' },
  Preparando: { bg: '#DBEAFE', color: '#1E40AF' },
  'En camino':{ bg: '#D1FAE5', color: '#065F46' },
  Entregado:  { bg: '#F3F4F6', color: '#374151' },
  Cancelado:  { bg: '#FEE2E2', color: '#991B1B' },
};

/* ─── COMPONENTE ADMIN ──────────────────────────────────────────────────── */
export default function AdminPlatos() {
  /* ── Platos ── */
  const [platos, setPlatos]           = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda]       = useState('');
  const [seleccionados, setSeleccionados] = useState(new Set()); // toggle masivo
  const [form, setForm]               = useState(FORM_VACIO);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [platoEditando, setPlatoEditando] = useState(null);
  const [modalPlato, setModalPlato]   = useState(false);
  const [enviando, setEnviando]       = useState(false);

  /* ── Pedidos ── */
  const [pedidos, setPedidos]         = useState([]);
  const [filtroPedido, setFiltroPedido] = useState('Todos');
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  /* ── Vista ── */
  const [vista, setVista]             = useState('platos'); // 'platos' | 'pedidos'
  const [toast, setToast]             = useState(null);

  /* ── Métricas ── */
  const [metricas, setMetricas]       = useState(null);

  const categorias = ['Todos', ...new Set(platos.map(p => p.category))];
  const platosFiltrados = platos
    .filter(p => categoriaActiva === 'Todos' || p.category === categoriaActiva)
    .filter(p => p.name.toLowerCase().includes(busqueda.toLowerCase()));

  const pedidosFiltrados = filtroPedido === 'Todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroPedido);

  /* ── Toast ── */
  const toast$ = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Cargar datos ── */
  const cargarPlatos = useCallback(() => {
    fetch('http://localhost:8080/api/platos')
      .then(r => r.json())
      .then(setPlatos)
      .catch(() => {});
  }, []);

  const cargarPedidos = useCallback(() => {
    fetch('http://localhost:8080/api/pedidos')
      .then(r => r.json())
      .then(data => {
        setPedidos(data);
        // Calcular métricas del día
        const hoy = new Date().toISOString().slice(0, 10);
        const pedidosHoy = data.filter(p => p.created_at?.slice(0, 10) === hoy);
        const ingresos = pedidosHoy.filter(p => p.estado !== 'Cancelado').reduce((s, p) => s + (p.total || 0), 0);
        // Plato más pedido (aproximado desde nombre_plato si disponible)
        setMetricas({
          totalHoy: pedidosHoy.length,
          ingresos,
          pendientes: data.filter(p => p.estado === 'Pendiente').length,
          enCamino: data.filter(p => p.estado === 'En camino').length,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => { cargarPlatos(); cargarPedidos(); }, [cargarPlatos, cargarPedidos]);

  // Polling pedidos cada 30 segundos
  useEffect(() => {
    const id = setInterval(cargarPedidos, 30000);
    return () => clearInterval(id);
  }, [cargarPedidos]);

  /* ══ PLATOS ══════════════════════════════════════════════════════════════ */

  /* ── Toggle individual ── */
  const toggleEstado = async (plato) => {
    try {
      const res = await fetch(`http://localhost:8080/api/platos/estado?id=${plato.id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPlatos(p => p.map(x => x.id === plato.id ? updated : x));
      toast$(updated.state === 1 ? 'Plato activado ✓' : 'Plato desactivado', updated.state === 1 ? 'ok' : 'warn');
    } catch { toast$('Error al cambiar estado', 'err'); }
  };

  /* ── Toggle masivo ── */
  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const seleccionarTodos = () => {
    if (seleccionados.size === platosFiltrados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(platosFiltrados.map(p => p.id)));
    }
  };

  const aplicarMasivoEstado = async (nuevoEstado) => {
    if (seleccionados.size === 0) { toast$('Selecciona al menos un plato', 'warn'); return; }
    setEnviando(true);
    try {
      await Promise.all([...seleccionados].map(id => {
        const plato = platos.find(p => p.id === id);
        if (!plato) return Promise.resolve();
        // Solo llamar si el estado es distinto al deseado
        if ((nuevoEstado === 1 && plato.state === 1) || (nuevoEstado === 0 && plato.state === 0)) return Promise.resolve();
        return fetch(`http://localhost:8080/api/platos/estado?id=${id}`, { method: 'PATCH' });
      }));
      cargarPlatos();
      setSeleccionados(new Set());
      toast$(`${seleccionados.size} platos actualizados ✓`);
    } catch { toast$('Error en actualización masiva', 'err'); }
    finally { setEnviando(false); }
  };

  /* ── CRUD Platos ── */
  const abrirRegistrar = () => { setForm(FORM_VACIO); setModoEdicion(false); setPlatoEditando(null); setModalPlato(true); };
  const abrirEditar    = (plato) => {
    setForm({ name: plato.name, image: null, imagePreview: `/src/assets/${plato.image}`, description: plato.description, price: plato.price, category: plato.category });
    setModoEdicion(true); setPlatoEditando(plato); setModalPlato(true);
  };
  const cerrarModal    = () => { setModalPlato(false); setForm(FORM_VACIO); };
  const handleChange   = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };
  const handleImagen   = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm(p => ({ ...p, image: f, imagePreview: URL.createObjectURL(f) }));
  };

  const handleRegistrar = async (e) => {
    e.preventDefault(); setEnviando(true);
    const payload = { name: form.name, image: form.image ? form.image.name : null, description: form.description, price: parseFloat(form.price), category: form.category };
    try {
      const res = await fetch('http://localhost:8080/api/platos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setPlatos(p => [...p, saved]);
      cerrarModal(); toast$('Plato registrado ✓');
    } catch { toast$('Error al registrar', 'err'); }
    finally { setEnviando(false); }
  };

  const handleActualizar = async (e) => {
    e.preventDefault(); setEnviando(true);
    const payload = { name: form.name, image: form.image ? form.image.name : platoEditando.image, description: form.description, price: parseFloat(form.price), category: form.category };
    try {
      const res = await fetch(`http://localhost:8080/api/platos?id=${platoEditando.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPlatos(p => p.map(x => x.id === platoEditando.id ? updated : x));
      cerrarModal(); toast$('Plato actualizado ✓');
    } catch { toast$('Error al actualizar', 'err'); }
    finally { setEnviando(false); }
  };

  /* ══ PEDIDOS ════════════════════════════════════════════════════════════ */
  const cambiarEstadoPedido = async (pedido, nuevoEstado) => {
    setCambiandoEstado(pedido.id);
    try {
      const res = await fetch(`http://localhost:8080/api/pedidos/estado?id=${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPedidos(p => p.map(x => x.id === pedido.id ? updated : x));
      if (pedidoDetalle?.id === pedido.id) setPedidoDetalle(updated);
      toast$(`Pedido #${pedido.id} → ${nuevoEstado} ✓`);
    } catch { toast$('Error al cambiar estado del pedido', 'err'); }
    finally { setCambiandoEstado(null); }
  };

  const siguienteEstado = (estadoActual) => {
    const idx = ESTADOS_PEDIDO.indexOf(estadoActual);
    if (idx < 0 || idx >= ESTADOS_PEDIDO.length - 2) return null; // -2 para no sugerir Cancelado
    return ESTADOS_PEDIDO[idx + 1];
  };

  /* ─────────────────────────── RENDER ─────────────────────────────────── */
  return (
    <div className="admin-root">
      {toast && <div className={`admin-toast admin-toast--${toast.tipo}`}>{toast.msg}</div>}

      {/* ── HEADER ── */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Panel de Administración</h1>
          <p className="admin-header__sub">Restaurante Panchita</p>
        </div>
        <div className="admin-header__tabs">
          <button className={`admin-tab ${vista === 'platos' ? 'activo' : ''}`} onClick={() => setVista('platos')}>🍽️ Platos / Carta</button>
          <button className={`admin-tab ${vista === 'pedidos' ? 'activo' : ''}`} onClick={() => setVista('pedidos')}>
            📦 Pedidos
            {metricas?.pendientes > 0 && <span className="admin-tab__badge">{metricas.pendientes}</span>}
          </button>
        </div>
      </div>

      {/* ── MÉTRICAS ── */}
      {metricas && (
        <div className="metricas-grid">
          <div className="metrica-card">
            <span className="metrica-card__icon">📋</span>
            <div>
              <div className="metrica-card__valor">{metricas.totalHoy}</div>
              <div className="metrica-card__label">Pedidos hoy</div>
            </div>
          </div>
          <div className="metrica-card">
            <span className="metrica-card__icon">💰</span>
            <div>
              <div className="metrica-card__valor">S/ {metricas.ingresos.toFixed(2)}</div>
              <div className="metrica-card__label">Ingresos hoy</div>
            </div>
          </div>
          <div className="metrica-card metrica-card--alert">
            <span className="metrica-card__icon">⏳</span>
            <div>
              <div className="metrica-card__valor">{metricas.pendientes}</div>
              <div className="metrica-card__label">Pendientes</div>
            </div>
          </div>
          <div className="metrica-card">
            <span className="metrica-card__icon">🛵</span>
            <div>
              <div className="metrica-card__valor">{metricas.enCamino}</div>
              <div className="metrica-card__label">En camino</div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ VISTA PLATOS ══════════════ */}
      {vista === 'platos' && (
        <div className="admin-section">

          {/* Toolbar platos */}
          <div className="admin-toolbar">
            <div className="admin-toolbar__left">
              <input className="admin-search" type="text" placeholder="🔍 Buscar plato..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <div className="admin-chips">
                {categorias.map(cat => (
                  <button key={cat} className={`admin-chip ${categoriaActiva === cat ? 'activo' : ''}`} onClick={() => setCategoriaActiva(cat)}>{cat}</button>
                ))}
              </div>
            </div>
            <button className="btn-nuevo" onClick={abrirRegistrar}>+ Nuevo plato</button>
          </div>

          {/* Barra masiva */}
          {seleccionados.size > 0 && (
            <div className="masivo-bar">
              <span className="masivo-bar__info">{seleccionados.size} plato(s) seleccionado(s)</span>
              <button className="masivo-btn masivo-btn--on" onClick={() => aplicarMasivoEstado(1)} disabled={enviando}>✓ Activar todos</button>
              <button className="masivo-btn masivo-btn--off" onClick={() => aplicarMasivoEstado(0)} disabled={enviando}>✕ Desactivar todos</button>
              <button className="masivo-btn masivo-btn--clear" onClick={() => setSeleccionados(new Set())}>Limpiar</button>
            </div>
          )}

          {/* Tabla platos */}
          <div className="platos-table-wrap">
            <table className="platos-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" checked={seleccionados.size === platosFiltrados.length && platosFiltrados.length > 0} onChange={seleccionarTodos} />
                  </th>
                  <th>Plato</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {platosFiltrados.map(plato => (
                  <tr key={plato.id} className={plato.state === 0 ? 'row-inactivo' : ''}>
                    <td><input type="checkbox" checked={seleccionados.has(plato.id)} onChange={() => toggleSeleccion(plato.id)} /></td>
                    <td>
                      <div className="plato-row">
                        <img src={`/src/assets/${plato.image}`} alt={plato.name} className="plato-row__img" onError={e => { e.target.style.display='none'; }} />
                        <div>
                          <div className="plato-row__name">{plato.name}</div>
                          <div className="plato-row__desc">{plato.description?.slice(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="cat-badge">{plato.category}</span></td>
                    <td className="precio-cell">S/ {plato.price.toFixed(2)}</td>
                    <td>
                      <button
                        className={`toggle-pill ${plato.state === 1 ? 'on' : 'off'}`}
                        onClick={() => toggleEstado(plato)}
                      >
                        <span className="toggle-pill__dot" />
                        {plato.state === 1 ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td>
                      <button className="action-btn action-btn--edit" onClick={() => abrirEditar(plato)}>✏️ Editar</button>
                    </td>
                  </tr>
                ))}
                {platosFiltrados.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No se encontraron platos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════ VISTA PEDIDOS ══════════════ */}
      {vista === 'pedidos' && (
        <div className="admin-section">

          {/* Filtros de estado */}
          <div className="admin-toolbar">
            <div className="admin-chips">
              {['Todos', ...ESTADOS_PEDIDO].map(est => (
                <button key={est} className={`admin-chip ${filtroPedido === est ? 'activo' : ''}`} onClick={() => setFiltroPedido(est)}>{est}</button>
              ))}
            </div>
            <button className="btn-refresh" onClick={cargarPedidos}>🔄 Actualizar</button>
          </div>

          {/* Lista pedidos */}
          <div className="pedidos-list">
            {pedidosFiltrados.length === 0 && (
              <div className="pedidos-empty">📭 No hay pedidos en esta categoría</div>
            )}
            {pedidosFiltrados.map(pedido => {
              const colores = ESTADO_COLOR[pedido.estado] || {};
              const siguiente = siguienteEstado(pedido.estado);
              return (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-card__head">
                    <div className="pedido-card__id">
                      <span className="pedido-card__num">#{pedido.id}</span>
                      <span className="pedido-card__cliente">{pedido.nombre_cliente}</span>
                    </div>
                    <div className="pedido-card__meta">
                      <span className="pedido-card__hora">{pedido.created_at ? new Date(pedido.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      <span className="estado-badge" style={{ background: colores.bg, color: colores.color }}>{pedido.estado}</span>
                    </div>
                  </div>

                  <div className="pedido-card__body">
                    <div className="pedido-card__info">
                      <span>📍 {pedido.distrito} — {pedido.direccion_entrega}</span>
                      <span>📱 {pedido.telefono_contacto}</span>
                      <span>💳 {pedido.metodo_pago}</span>
                    </div>
                    <div className="pedido-card__total">S/ {pedido.total?.toFixed(2)}</div>
                  </div>

                  <div className="pedido-card__actions">
                    <button className="pedido-btn pedido-btn--detail" onClick={() => setPedidoDetalle(pedido)}>Ver detalle</button>
                    {siguiente && (
                      <button
                        className="pedido-btn pedido-btn--next"
                        onClick={() => cambiarEstadoPedido(pedido, siguiente)}
                        disabled={cambiandoEstado === pedido.id}
                      >
                        {cambiandoEstado === pedido.id ? 'Actualizando...' : `→ ${siguiente}`}
                      </button>
                    )}
                    {pedido.estado !== 'Cancelado' && pedido.estado !== 'Entregado' && (
                      <button className="pedido-btn pedido-btn--cancel" onClick={() => cambiarEstadoPedido(pedido, 'Cancelado')}>✕ Cancelar</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ MODAL PLATO ══ */}
      {modalPlato && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">{modoEdicion ? '✏️ Actualizar Plato' : '🍽️ Nuevo Plato'}</h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>
            <form className="modal-form" onSubmit={modoEdicion ? handleActualizar : handleRegistrar}>
              <div className="modal-img-preview-wrap">
                {form.imagePreview
                  ? <img src={form.imagePreview} alt="preview" className="modal-img-preview" />
                  : <div className="modal-img-placeholder">📷 Selecciona una imagen</div>
                }
              </div>
              <div className="modal-campo">
                <label className="modal-label">Imagen del plato</label>
                <label className="modal-file-label">
                  <input type="file" accept="image/*" className="modal-file-input" onChange={handleImagen} />
                  <span className="modal-file-btn">📂 Seleccionar archivo</span>
                  <span className="modal-file-nombre">{form.image ? form.image.name : 'Ningún archivo'}</span>
                </label>
              </div>
              <div className="modal-campo">
                <label className="modal-label">Nombre <span className="modal-req">*</span></label>
                <input className="modal-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Ej: Lomo Saltado" required />
              </div>
              <div className="modal-campo">
                <label className="modal-label">Descripción <span className="modal-req">*</span></label>
                <textarea className="modal-input modal-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Ingredientes principales..." required rows={3} />
              </div>
              <div className="modal-fila">
                <div className="modal-campo">
                  <label className="modal-label">Precio (S/) <span className="modal-req">*</span></label>
                  <input className="modal-input" type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" step="0.01" min="0" required />
                </div>
                <div className="modal-campo">
                  <label className="modal-label">Categoría <span className="modal-req">*</span></label>
                  <select className="modal-input" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    {[...new Set(platos.map(p => p.category))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__nueva__">+ Nueva categoría</option>
                  </select>
                  {form.category === '__nueva__' && (
                    <input className="modal-input" style={{ marginTop: 8 }} type="text" placeholder="Nombre de la nueva categoría" onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                  )}
                </div>
              </div>
              <p className="modal-nota"><span className="modal-req">*</span> Campos obligatorios</p>
              <button className="modal-btn-submit" type="submit" disabled={enviando}>
                {enviando ? 'Procesando...' : modoEdicion ? '💾 Guardar cambios' : '✚ Registrar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL DETALLE PEDIDO ══ */}
      {pedidoDetalle && (
        <div className="modal-overlay" onClick={() => setPedidoDetalle(null)}>
          <div className="modal-panel modal-panel--pedido" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">📦 Pedido #{pedidoDetalle.id}</h3>
              <button className="modal-cerrar" onClick={() => setPedidoDetalle(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="pedido-detalle-info">
                <div className="pdi-row"><span>Cliente</span><strong>{pedidoDetalle.nombre_cliente}</strong></div>
                <div className="pdi-row"><span>Teléfono</span><strong>{pedidoDetalle.telefono_contacto}</strong></div>
                <div className="pdi-row"><span>Dirección</span><strong>{pedidoDetalle.direccion_entrega}, {pedidoDetalle.distrito}</strong></div>
                {pedidoDetalle.referencia && <div className="pdi-row"><span>Referencia</span><strong>{pedidoDetalle.referencia}</strong></div>}
                <div className="pdi-row"><span>Pago</span><strong>{pedidoDetalle.metodo_pago}</strong></div>
                <div className="pdi-row"><span>Estado</span>
                  <span className="estado-badge" style={{ ...(ESTADO_COLOR[pedidoDetalle.estado] || {}) }}>{pedidoDetalle.estado}</span>
                </div>
              </div>

              <h4 style={{ margin: '16px 0 8px', fontSize: '.9rem', color: '#6B7280' }}>ITEMS DEL PEDIDO</h4>
              {pedidoDetalle.items?.map((item, i) => (
                <div key={i} className="pdi-item">
                  <span>{item.cantidad}x {item.nombre_plato || item.plato?.name}</span>
                  <span>S/ {item.subtotal?.toFixed(2) || (item.precio_unitario * item.cantidad).toFixed(2)}</span>
                </div>
              ))}

              <div className="pdi-total">
                <span>Total</span>
                <strong style={{ color: '#C0392B' }}>S/ {pedidoDetalle.total?.toFixed(2)}</strong>
              </div>

              {/* Cambio de estado desde detalle */}
              <div style={{ marginTop: 20 }}>
                <label className="modal-label">Cambiar estado</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {ESTADOS_PEDIDO.map(est => (
                    <button
                      key={est}
                      className={`estado-btn ${pedidoDetalle.estado === est ? 'activo' : ''}`}
                      onClick={() => cambiarEstadoPedido(pedidoDetalle, est)}
                      disabled={cambiandoEstado === pedidoDetalle.id}
                    >
                      {est}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}