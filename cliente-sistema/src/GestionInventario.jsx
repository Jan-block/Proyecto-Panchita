import { useState, useEffect, useMemo } from 'react';
import './GestionInventario.css';
import { apiFetch } from './api';

const FORM_VACIO = {
  codigoProducto: '', nombre: '', fechaVencimiento: '', cantidad: '',
  unidadMedida: '', lugarAlmacenaje: '', stockMinimo: '',
};

const MOVIMIENTO_VACIO = { cantidad: '', observacion: '' };

// Cuántos días antes del vencimiento se considera "por vencer" (badge amarillo).
const DIAS_ALERTA_VENCIMIENTO = 3;

function estadoVencimiento(fechaVencimiento) {
  if (!fechaVencimiento) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento + 'T00:00:00');
  const diffDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return { texto: 'Vencido', clase: 'vencido' };
  if (diffDias <= DIAS_ALERTA_VENCIMIENTO) return { texto: `Vence en ${diffDias}d`, clase: 'por-vencer' };
  return { texto: vencimiento.toLocaleDateString('es-PE'), clase: 'ok' };
}

export default function GestionInventario({ usuarioLogueado }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroAlmacen, setFiltroAlmacen] = useState('Todos');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);

  const [modalMovimiento, setModalMovimiento] = useState(null); // { producto, tipo: 'COMPRA'|'CONSUMO' }
  const [movForm, setMovForm] = useState(MOVIMIENTO_VACIO);

  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  const esAdmin = usuarioLogueado?.rol === 'administrador';

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargarProductos = () => {
    apiFetch('/api/inventario')
      .then(res => { if (!res.ok) throw new Error('Error al obtener el inventario'); return res.json(); })
      .then(setProductos)
      .catch(err => console.error('Error:', err));
  };

  useEffect(() => { cargarProductos(); }, []);

  const almacenes = ['Todos', ...new Set(productos.map(p => p.lugarAlmacenaje).filter(Boolean))];

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const coincideAlmacen = filtroAlmacen === 'Todos' || p.lugarAlmacenaje === filtroAlmacen;
      const coincideBusqueda = !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigoProducto.toLowerCase().includes(busqueda.toLowerCase());
      return coincideAlmacen && coincideBusqueda;
    });
  }, [productos, filtroAlmacen, busqueda]);

  // ── Modal registrar / editar datos maestros ──
  const abrirModalRegistrar = () => {
    setForm(FORM_VACIO);
    setModoEdicion(false);
    setProductoEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setForm({
      codigoProducto: producto.codigoProducto,
      nombre: producto.nombre,
      fechaVencimiento: producto.fechaVencimiento || '',
      cantidad: producto.cantidad,
      unidadMedida: producto.unidadMedida,
      lugarAlmacenaje: producto.lugarAlmacenaje,
      stockMinimo: producto.stockMinimo ?? '',
    });
    setModoEdicion(true);
    setProductoEditando(producto);
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

  const handleRegistrar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const response = await apiFetch('/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoProducto: form.codigoProducto,
          nombre: form.nombre,
          fechaVencimiento: form.fechaVencimiento || null,
          cantidad: parseFloat(form.cantidad) || 0,
          unidadMedida: form.unidadMedida,
          lugarAlmacenaje: form.lugarAlmacenaje,
          stockMinimo: form.stockMinimo ? parseFloat(form.stockMinimo) : 0,
        }),
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Error al registrar el producto');
      }
      const guardado = await response.json();
      setProductos(prev => [...prev, guardado]);
      cerrarModal();
      mostrarToast('Producto registrado correctamente ✓');
    } catch (err) {
      console.error(err);
      mostrarToast(err.message || 'Error al registrar el producto', 'err');
    } finally {
      setEnviando(false);
    }
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const response = await apiFetch(`/api/inventario?id=${productoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoProducto: form.codigoProducto,
          nombre: form.nombre,
          fechaVencimiento: form.fechaVencimiento || null,
          unidadMedida: form.unidadMedida,
          lugarAlmacenaje: form.lugarAlmacenaje,
          stockMinimo: form.stockMinimo ? parseFloat(form.stockMinimo) : 0,
        }),
      });
      if (!response.ok) throw new Error('Error al actualizar el producto');
      const actualizado = await response.json();
      setProductos(prev => prev.map(p => p.id === productoEditando.id ? actualizado : p));
      cerrarModal();
      mostrarToast('Producto actualizado correctamente ✓');
    } catch (err) {
      console.error(err);
      mostrarToast('Error al actualizar el producto', 'err');
    } finally {
      setEnviando(false);
    }
  };

  const toggleEstado = async (producto) => {
    try {
      const response = await apiFetch(`/api/inventario/estado?id=${producto.id}`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Error al cambiar el estado');
      const actualizado = await response.json();
      setProductos(prev => prev.map(p => p.id === producto.id ? actualizado : p));
      mostrarToast(
        actualizado.state === 1 ? 'Producto activado ✓' : 'Producto desactivado',
        actualizado.state === 1 ? 'ok' : 'warn'
      );
    } catch (err) {
      console.error(err);
      mostrarToast('Error al cambiar el estado', 'err');
    }
  };

  // ── Modal de compra/consumo (mueve el stock en tiempo real) ──
  const abrirModalMovimiento = (producto, tipo) => {
    setMovForm(MOVIMIENTO_VACIO);
    setModalMovimiento({ producto, tipo });
  };

  const cerrarModalMovimiento = () => {
    setModalMovimiento(null);
    setMovForm(MOVIMIENTO_VACIO);
  };

  const handleMovimiento = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const { producto, tipo } = modalMovimiento;
    const endpoint = tipo === 'COMPRA' ? '/api/inventario/compra' : '/api/inventario/consumo';

    try {
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoId: producto.id,
          cantidad: parseFloat(movForm.cantidad),
          observacion: movForm.observacion,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || `Error al registrar el ${tipo === 'COMPRA' ? 'compra' : 'consumo'}`);
      }

      const actualizado = await response.json();
      setProductos(prev => prev.map(p => p.id === producto.id ? actualizado : p));
      cerrarModalMovimiento();
      mostrarToast(
        tipo === 'COMPRA'
          ? `Compra registrada — nuevo stock: ${actualizado.cantidad} ${actualizado.unidadMedida} ✓`
          : `Consumo registrado — stock disponible: ${actualizado.cantidad} ${actualizado.unidadMedida} ✓`
      );
    } catch (err) {
      console.error(err);
      mostrarToast(err.message, 'err');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="inv-wrapper">
      {toast && <div className={`inv-toast inv-toast--${toast.tipo}`}>{toast.msg}</div>}

      <div className="inv-header">
        <div className="inv-header__centro">
          <span className="inv-eyebrow">Restaurante Panchita</span>
          <h2 className="inv-titulo">Inventario</h2>
          <div className="inv-separador" />
          <p className="inv-subtitulo">
            Control de insumos, vencimientos y stock disponible en tiempo real.
          </p>
        </div>
        {esAdmin && (
          <button className="btn-agregar-inv" onClick={abrirModalRegistrar} title="Registrar nuevo producto">
            +
          </button>
        )}
      </div>

      {/* ── FILTROS ── */}
      <div className="inv-filtros">
        <input
          className="inv-buscador"
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div className="inv-chips">
          {almacenes.map(a => (
            <button
              key={a}
              className={`inv-chip ${filtroAlmacen === a ? 'activo' : ''}`}
              onClick={() => setFiltroAlmacen(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {productosFiltrados.length === 0 && (
        <p className="inv-vacio">No hay productos registrados{busqueda || filtroAlmacen !== 'Todos' ? ' con ese filtro.' : ' todavía.'}</p>
      )}

      {/* ── TABLA DE PRODUCTOS ── */}
      {productosFiltrados.length > 0 && (
        <div className="inv-tabla-wrap">
          <table className="inv-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Stock</th>
                <th>Vencimiento</th>
                <th>Almacenaje</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => {
                const venc = estadoVencimiento(p.fechaVencimiento);
                const bajoStock = p.stockMinimo != null && Number(p.cantidad) <= Number(p.stockMinimo) && Number(p.stockMinimo) > 0;
                return (
                  <tr key={p.id} className={p.state === 0 ? 'inv-fila--inactiva' : ''}>
                    <td className="inv-codigo">{p.codigoProducto}</td>
                    <td>{p.nombre}</td>
                    <td>
                      <span className={`inv-stock ${bajoStock ? 'inv-stock--bajo' : ''}`}>
                        {Number(p.cantidad).toFixed(2)} {p.unidadMedida}
                      </span>
                      {bajoStock && <span className="inv-badge-bajo">Stock bajo</span>}
                    </td>
                    <td>
                      {venc
                        ? <span className={`inv-venc inv-venc--${venc.clase}`}>{venc.texto}</span>
                        : <span className="inv-venc-sin">—</span>}
                    </td>
                    <td>{p.lugarAlmacenaje}</td>
                    {esAdmin && (
                      <td className="inv-acciones">
                        <button
                          className="inv-btn inv-btn--compra"
                          onClick={() => abrirModalMovimiento(p, 'COMPRA')}
                          title="Registrar compra (suma stock)"
                        >
                          + Compra
                        </button>
                        <button
                          className="inv-btn inv-btn--consumo"
                          onClick={() => abrirModalMovimiento(p, 'CONSUMO')}
                          title="Registrar consumo de cocina (resta stock)"
                        >
                          − Consumo
                        </button>
                        <button className="inv-btn inv-btn--editar" onClick={() => abrirModalEditar(p)}>
                          Editar
                        </button>
                        <button
                          className={`inv-toggle ${p.state === 1 ? 'activo' : 'inactivo'}`}
                          onClick={() => toggleEstado(p)}
                        >
                          {p.state === 1 ? 'ON' : 'OFF'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: REGISTRAR / EDITAR PRODUCTO ── */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">{modoEdicion ? '✏️ Actualizar Producto' : '📦 Nuevo Producto'}</h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            <form className="modal-form" onSubmit={modoEdicion ? handleActualizar : handleRegistrar}>
              <div className="modal-campo">
                <label className="modal-label">Código de producto <span className="modal-req">*</span></label>
                <input
                  className="modal-input"
                  type="text"
                  name="codigoProducto"
                  value={form.codigoProducto}
                  onChange={handleChange}
                  placeholder="Ej: INS-0001"
                  required
                />
              </div>

              <div className="modal-campo">
                <label className="modal-label">Nombre <span className="modal-req">*</span></label>
                <input
                  className="modal-input"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Pechuga de pollo"
                  required
                />
              </div>

              <div className="modal-fila">
                <div className="modal-campo">
                  <label className="modal-label">
                    {modoEdicion ? 'Stock actual' : 'Cantidad inicial'} <span className="modal-req">*</span>
                  </label>
                  <input
                    className="modal-input"
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={modoEdicion}
                    title={modoEdicion ? 'El stock solo se ajusta con Compra o Consumo' : ''}
                  />
                </div>
                <div className="modal-campo">
                  <label className="modal-label">Unidad de medida <span className="modal-req">*</span></label>
                  <input
                    className="modal-input"
                    type="text"
                    name="unidadMedida"
                    value={form.unidadMedida}
                    onChange={handleChange}
                    placeholder="Ej: kg, litros, unidades"
                    required
                  />
                </div>
              </div>

              {modoEdicion && (
                <p className="inv-nota-editar">
                  El stock ({Number(form.cantidad).toFixed(2)} {form.unidadMedida}) solo se actualiza registrando una Compra o un Consumo desde la tabla, para mantener el historial de movimientos.
                </p>
              )}

              <div className="modal-fila">
                <div className="modal-campo">
                  <label className="modal-label">Fecha de vencimiento</label>
                  <input
                    className="modal-input"
                    type="date"
                    name="fechaVencimiento"
                    value={form.fechaVencimiento}
                    onChange={handleChange}
                  />
                </div>
                <div className="modal-campo">
                  <label className="modal-label">Stock mínimo (alerta)</label>
                  <input
                    className="modal-input"
                    type="number"
                    name="stockMinimo"
                    value={form.stockMinimo}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-campo">
                <label className="modal-label">Lugar de almacenaje <span className="modal-req">*</span></label>
                <input
                  className="modal-input"
                  type="text"
                  name="lugarAlmacenaje"
                  value={form.lugarAlmacenaje}
                  onChange={handleChange}
                  placeholder="Ej: Almacén seco, Refrigerador 1"
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

      {/* ── MODAL: COMPRA / CONSUMO ── */}
      {modalMovimiento && (
        <div className="modal-overlay" onClick={cerrarModalMovimiento}>
          <div className="modal-panel modal-panel--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">
                {modalMovimiento.tipo === 'COMPRA' ? '🛒 Registrar Compra' : '🍳 Registrar Consumo'}
              </h3>
              <button className="modal-cerrar" onClick={cerrarModalMovimiento}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleMovimiento}>
              <p className="inv-mov-producto">
                <strong>{modalMovimiento.producto.nombre}</strong> — stock actual:{' '}
                {Number(modalMovimiento.producto.cantidad).toFixed(2)} {modalMovimiento.producto.unidadMedida}
              </p>

              <div className="modal-campo">
                <label className="modal-label">
                  Cantidad a {modalMovimiento.tipo === 'COMPRA' ? 'sumar' : 'restar'} <span className="modal-req">*</span>
                </label>
                <input
                  className="modal-input"
                  type="number"
                  value={movForm.cantidad}
                  onChange={e => setMovForm(prev => ({ ...prev, cantidad: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                />
              </div>

              <div className="modal-campo">
                <label className="modal-label">Observación</label>
                <input
                  className="modal-input"
                  type="text"
                  value={movForm.observacion}
                  onChange={e => setMovForm(prev => ({ ...prev, observacion: e.target.value }))}
                  placeholder={modalMovimiento.tipo === 'COMPRA' ? 'Ej: Compra proveedor semanal' : 'Ej: Usado en Lomo Saltado'}
                />
              </div>

              <button
                className={`modal-btn-submit ${modalMovimiento.tipo === 'CONSUMO' ? 'modal-btn-submit--consumo' : ''}`}
                type="submit"
                disabled={enviando}
              >
                {enviando ? 'Procesando...' : modalMovimiento.tipo === 'COMPRA' ? '✚ Sumar al stock' : '− Descontar del stock'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
