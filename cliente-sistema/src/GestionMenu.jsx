import { useState, useEffect } from 'react';
import './GestionMenu.css';
import { apiFetch } from './api';

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', entradaId: '', fondoId: '', bebidaId: '' };

export default function GestionMenu({ usuarioLogueado }) {
  const [menus, setMenus] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [menuEditando, setMenuEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  const esAdmin = usuarioLogueado?.rol === 'administrador';

  // Los "roles" del combo se arman con cualquier plato ya registrado en
  // Platos/Carta; el admin elige cuál corresponde a cada parte.
  const menusVisibles = esAdmin ? menus : menus.filter(m => m.state === 1);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargarMenus = () => {
    apiFetch('/api/menus')
      .then(res => { if (!res.ok) throw new Error('Error al obtener los menús'); return res.json(); })
      .then(setMenus)
      .catch(err => console.error('Error:', err));
  };

  const cargarPlatos = () => {
    apiFetch('/api/platos')
      .then(res => { if (!res.ok) throw new Error('Error al obtener los platos'); return res.json(); })
      .then(data => setPlatos(data.filter(p => p.state === 1)))
      .catch(err => console.error('Error:', err));
  };

  useEffect(() => { cargarMenus(); cargarPlatos(); }, []);

  const abrirModalRegistrar = () => {
    setForm(FORM_VACIO);
    setModoEdicion(false);
    setMenuEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (menu) => {
    setForm({
      nombre: menu.nombre,
      descripcion: menu.descripcion || '',
      precio: menu.precio,
      entradaId: menu.entrada?.id ?? '',
      fondoId: menu.fondo?.id ?? '',
      bebidaId: menu.bebida?.id ?? '',
    });
    setModoEdicion(true);
    setMenuEditando(menu);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm(FORM_VACIO);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const construirPayload = () => ({
    nombre: form.nombre,
    descripcion: form.descripcion,
    precio: parseFloat(form.precio),
    entradaId: parseInt(form.entradaId, 10),
    fondoId: parseInt(form.fondoId, 10),
    bebidaId: parseInt(form.bebidaId, 10),
  });

  const handleRegistrar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const response = await apiFetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(construirPayload()),
      });
      if (!response.ok) throw new Error('Error al registrar el menú');
      const menuGuardado = await response.json();
      setMenus(prev => [...prev, menuGuardado]);
      cerrarModal();
      mostrarToast('Menú registrado correctamente ✓');
    } catch (err) {
      console.error(err);
      mostrarToast('Error al registrar el menú', 'err');
    } finally {
      setEnviando(false);
    }
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const response = await apiFetch(`/api/menus?id=${menuEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(construirPayload()),
      });
      if (!response.ok) throw new Error('Error al actualizar el menú');
      const menuActualizado = await response.json();
      setMenus(prev => prev.map(m => m.id === menuEditando.id ? menuActualizado : m));
      cerrarModal();
      mostrarToast('Menú actualizado correctamente ✓');
    } catch (err) {
      console.error(err);
      mostrarToast('Error al actualizar el menú', 'err');
    } finally {
      setEnviando(false);
    }
  };

  const toggleEstado = async (menu) => {
    try {
      const response = await apiFetch(`/api/menus/estado?id=${menu.id}`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Error al cambiar el estado');
      const menuActualizado = await response.json();
      setMenus(prev => prev.map(m => m.id === menu.id ? menuActualizado : m));
      mostrarToast(
        menuActualizado.state === 1 ? 'Menú activado ✓' : 'Menú desactivado',
        menuActualizado.state === 1 ? 'ok' : 'warn'
      );
    } catch (err) {
      console.error(err);
      mostrarToast('Error al cambiar el estado', 'err');
    }
  };

  // Suma de referencia de los 3 componentes elegidos, para que el admin vea
  // cuánto costarían por separado frente al precio de menú que va a fijar.
  const platoPorId = (id) => platos.find(p => p.id === parseInt(id, 10));
  const sumaReferencia = ['entradaId', 'fondoId', 'bebidaId']
    .map(campo => platoPorId(form[campo])?.price || 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="menu-wrapper">
      {toast && <div className={`menu-toast menu-toast--${toast.tipo}`}>{toast.msg}</div>}

      <div className="menu-header">
        <div className="menu-header__centro">
          <span className="menu-eyebrow">Restaurante Panchita</span>
          <h2 className="menu-titulo">Menú del Día</h2>
          <div className="menu-separador" />
          <p className="menu-subtitulo">
            Entrada + plato fuerte + bebida, a un precio accesible.
          </p>
        </div>
        {esAdmin && (
          <button className="btn-agregar-menu" onClick={abrirModalRegistrar} title="Agregar nuevo menú">
            +
          </button>
        )}
      </div>

      {menusVisibles.length === 0 && (
        <p className="menu-vacio">Todavía no hay menús registrados.</p>
      )}

      <div className="menu-grid">
        {menusVisibles.map(menu => (
          <div key={menu.id} className={`menu-card ${esAdmin && menu.state === 0 ? 'menu-card--inactivo' : ''}`}>
            <div className="menu-card__header">
              <h3 className="menu-card__nombre">{menu.nombre}</h3>
              <span className="menu-card__precio">S/ {menu.precio?.toFixed(2)}</span>
            </div>

            {menu.descripcion && <p className="menu-card__descripcion">{menu.descripcion}</p>}

            <div className="menu-card__items">
              <div className="menu-card__item">
                <span className="menu-card__etiqueta">Entrada</span>
                <span>{menu.entrada?.name}</span>
              </div>
              <div className="menu-card__item">
                <span className="menu-card__etiqueta">Plato fuerte</span>
                <span>{menu.fondo?.name}</span>
              </div>
              <div className="menu-card__item">
                <span className="menu-card__etiqueta">Bebida</span>
                <span>{menu.bebida?.name}</span>
              </div>
            </div>

            {esAdmin && (
              <div className="menu-card__footer">
                <button
                  className={`menu-card__toggle ${menu.state === 1 ? 'activo' : 'inactivo'}`}
                  onClick={() => toggleEstado(menu)}
                >
                  {menu.state === 1 ? 'ON' : 'OFF'}
                </button>
                <button className="menu-card__btn" onClick={() => abrirModalEditar(menu)}>
                  Actualizar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">{modoEdicion ? '✏️ Actualizar Menú' : '🍽️ Nuevo Menú'}</h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            <form className="modal-form" onSubmit={modoEdicion ? handleActualizar : handleRegistrar}>
              <div className="modal-campo">
                <label className="modal-label">Nombre del menú <span className="modal-req">*</span></label>
                <input
                  className="modal-input"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Menú Ejecutivo"
                  required
                />
              </div>

              <div className="modal-campo">
                <label className="modal-label">Descripción</label>
                <textarea
                  className="modal-input modal-textarea"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Ej: Disponible de lunes a viernes al mediodía"
                  rows={2}
                />
              </div>

              <div className="modal-campo">
                <label className="modal-label">Entrada <span className="modal-req">*</span></label>
                <select className="modal-input" name="entradaId" value={form.entradaId} onChange={handleChange} required>
                  <option value="">Seleccionar plato...</option>
                  {platos.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — S/ {p.price?.toFixed(2)} ({p.category})</option>
                  ))}
                </select>
              </div>

              <div className="modal-campo">
                <label className="modal-label">Plato fuerte <span className="modal-req">*</span></label>
                <select className="modal-input" name="fondoId" value={form.fondoId} onChange={handleChange} required>
                  <option value="">Seleccionar plato...</option>
                  {platos.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — S/ {p.price?.toFixed(2)} ({p.category})</option>
                  ))}
                </select>
              </div>

              <div className="modal-campo">
                <label className="modal-label">Bebida <span className="modal-req">*</span></label>
                <select className="modal-input" name="bebidaId" value={form.bebidaId} onChange={handleChange} required>
                  <option value="">Seleccionar plato...</option>
                  {platos.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — S/ {p.price?.toFixed(2)} ({p.category})</option>
                  ))}
                </select>
              </div>

              {sumaReferencia > 0 && (
                <p className="menu-referencia">
                  Suma por separado: <strong>S/ {sumaReferencia.toFixed(2)}</strong> — ajusta el precio del menú abajo para que sea más accesible.
                </p>
              )}

              <div className="modal-campo">
                <label className="modal-label">Precio del menú (S/) <span className="modal-req">*</span></label>
                <input
                  className="modal-input"
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="12.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <p className="modal-nota"><span className="modal-req">*</span> Campos obligatorios</p>

              <button className="modal-btn-submit" type="submit" disabled={enviando}>
                {enviando ? 'Procesando...' : modoEdicion ? '💾 Guardar cambios' : '✚ Registrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
