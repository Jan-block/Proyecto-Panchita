import { useState, useEffect } from 'react';
import './NuestraCarta.css';

const FORM_VACIO = { name: '', image: null, imagePreview: null, description: '', price: '', category: '' };

export default function NuestraCarta({ usuarioLogueado }) {

  const [platos, setPlatos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [platoEditando, setPlatoEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  const esAdmin = usuarioLogueado?.rol === 'administrador';
  const categorias = ['Todos', ...new Set(platos.map(p => p.category))];


  const platosFiltrados = categoriaActiva === 'Todos'
    ? platos
    : platos.filter(p => p.category === categoriaActiva);

  /* CARGAR LISTA DE PLATILLOS */
  useEffect(() => {
    fetch('http://localhost:8080/api/platos')
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al obtener los platos');
        }
        return res.json();
      })
      .then(data => {
        esAdmin ? setPlatos(data) : setPlatos(data.filter(
          plato => plato.state === 1
        ));
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [esAdmin]);

  // ── Toast ──
  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Abrir modal REGISTRAR ──
  const abrirModalRegistrar = () => {
    setForm(FORM_VACIO);
    setModoEdicion(false);
    setPlatoEditando(null);
    setModalAbierto(true);
  };

  // ── Abrir modal EDITAR ──
  const abrirModalEditar = (plato) => {
    setForm({
      name: plato.name,
      image: null,
      imagePreview: `/src/assets/${plato.image}`,
      description: plato.description,
      price: plato.price,
      category: plato.category,
    });
    setModoEdicion(true);
    setPlatoEditando(plato);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm(FORM_VACIO);
  };

  // ── Cambios de inputs ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ── Selección de imagen ──
  const handleImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setForm(prev => ({
      ...prev,
      image: archivo,
      imagePreview: URL.createObjectURL(archivo),
    }));
  };

  // ── REGISTRAR ──
  const handleRegistrar = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const payload = {
      name: form.name,
      image: form.image ? form.image.name : null,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
    };

    try {
      const response = await fetch('http://localhost:8080/api/platos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al registrar el plato');

      const platoGuardado = await response.json();

      setPlatos(prev => [...prev, platoGuardado]);
      cerrarModal();
      mostrarToast('Plato registrado correctamente ✓');
    } catch (err) {
      console.error(err);
      mostrarToast('Error al registrar el plato', err);
    } finally {
      setEnviando(false);
    }
  };

  // ── ACTUALIZAR ──
  const handleActualizar = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const payload = {
      name: form.name,
      image: form.image ? form.image.name : platoEditando.image,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
    };

    try {
      const response = await fetch(`http://localhost:8080/api/platos?id=${platoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al actualizar el plato');

      const platoActualizado = await response.json();

      setPlatos(prev => prev.map(p =>
        p.id === platoEditando.id ? platoActualizado : p
      ));
      cerrarModal();
      mostrarToast('Plato actualizado correctamente ✓');
    } catch (err) {
      console.error(err);
      mostrarToast('Error al actualizar el plato', err);
    } finally {
      setEnviando(false);
    }
  };

  // ── TOGGLE ESTADO ──
  const toggleEstado = async (plato) => {
    try {
      const response = await fetch(`http://localhost:8080/api/platos/estado?id=${plato.id}`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Error al cambiar el estado');

      const platoActualizado = await response.json();

      setPlatos(prev => prev.map(p =>
        p.id === plato.id ? platoActualizado : p
      ));
      mostrarToast(
        platoActualizado.state === 1 ? 'Plato activado ✓' : 'Plato desactivado',
        platoActualizado.state === 1 ? 'ok' : 'warn'
      );
    } catch (err) {
      console.error(err);
      mostrarToast('Error al cambiar el estado', err);
    }
  };

  return (
    <div className="carta-wrapper">

      {/* ── TOAST ── */}
      {toast && <div className={`carta-toast carta-toast--${toast.tipo}`}>{toast.msg}</div>}


      {/*Header*/}
      <div className="carta-header">
        <div className="carta-header__grid">
          {/* columna izquierda vacía para centrar */}
          <div />

          <div className="carta-header__centro">
            <span className="carta-eyebrow">Restaurante Panchita</span>
            <h2 className="carta-titulo">Nuestra Carta</h2>
            <div className="carta-separador" />
            <p className="carta-subtitulo">
              Platos elaborados con ingredientes frescos y las recetas de siempre.
            </p>
          </div>

          {/* Botón "+" solo para admin */}
          <div className="carta-header__acciones">
            {esAdmin && (
              <button
                className="btn-agregar-plato"
                onClick={abrirModalRegistrar}
                title="Agregar nuevo plato"
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>


      {/*filtrar por categoría*/}
      <div className="carta-filtros">
        {categorias.map(cat => (
          <button
            key={cat}
            className={`carta-chip ${categoriaActiva === cat ? 'activo' : ''}`}
            onClick={() => setCategoriaActiva(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/*lista de platillos*/}
      <div className="carta-grid">
        {platosFiltrados.map(plato => (
          <div
            key={plato.id}
            className={`plato-card ${esAdmin && plato.state === 0 ? 'plato-card--inactivo' : ''}`}
          >
            <div className="plato-card__imagen-wrap">
              <img
                src={`/src/assets/${plato.image}`}
                alt={plato.name}
                className="plato-card__imagen"
              />

              {/* Badge categoría — izquierda */}
              <span className="plato-card__categoria">{plato.category}</span>

              {/* Toggle estado — derecha, solo admin */}
              {esAdmin && (
                <button
                  className={`plato-card__toggle ${plato.state === 1 ? 'activo' : 'inactivo'}`}
                  onClick={() => toggleEstado(plato)}
                  title={plato.state === 1 ? 'Desactivar plato' : 'Activar plato'}
                >
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                  <span className="toggle-label">{plato.state === 1 ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            <div className="plato-card__body">
              <div className="plato-card__info">
                <h3 className="plato-card__nombre">{plato.name}</h3>
                <p className="plato-card__descripcion">{plato.description}</p>
              </div>
              <div className="plato-card__footer">
                <span className="plato-card__precio">S/ {plato.price.toFixed(2)}</span>
                {esAdmin && (
                  <button
                    className="plato-card__btn"
                    onClick={() => abrirModalEditar(plato)}
                  >
                    Actualizar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* ── MODAL ── */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-panel" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <h3 className="modal-titulo">
                {modoEdicion ? '✏️ Actualizar Plato' : '🍽️ Nuevo Plato'}
              </h3>
              <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            </div>

            <form
              className="modal-form"
              onSubmit={modoEdicion ? handleActualizar : handleRegistrar}
            >
              {/* Preview imagen */}
              <div className="modal-img-preview-wrap">
                {form.imagePreview
                  ? <img src={form.imagePreview} alt="preview" className="modal-img-preview" />
                  : <div className="modal-img-placeholder">📷 Selecciona una imagen</div>
                }
              </div>

              {/* Selector de imagen */}
              <div className="modal-campo">
                <label className="modal-label">Imagen del plato</label>
                <label className="modal-file-label">
                  <input
                    type="file"
                    accept="image/*"
                    className="modal-file-input"
                    onChange={handleImagen}
                  />
                  <span className="modal-file-btn">📂 Seleccionar archivo</span>
                  <span className="modal-file-nombre">
                    {form.image ? form.image.name : 'Ningún archivo seleccionado'}
                  </span>
                </label>
              </div>

              {/* Name */}
              <div className="modal-campo">
                <label className="modal-label">
                  Nombre del plato <span className="modal-req">*</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Lomo Saltado"
                  required
                />
              </div>

              {/* Description */}
              <div className="modal-campo">
                <label className="modal-label">
                  Descripción <span className="modal-req">*</span>
                </label>
                <textarea
                  className="modal-input modal-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Ingredientes principales..."
                  required
                  rows={3}
                />
              </div>

              {/* Price + Category en fila */}
              <div className="modal-fila">
                <div className="modal-campo">
                  <label className="modal-label">
                    Precio (S/) <span className="modal-req">*</span>
                  </label>
                  <input
                    className="modal-input"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="modal-campo">
                  <label className="modal-label">
                    Categoría <span className="modal-req">*</span>
                  </label>
                  <input
                    className="modal-input"
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Ej: Fondos"
                    required
                  />
                </div>
              </div>

              <p className="modal-nota"><span className="modal-req">*</span> Campos obligatorios</p>

              <button className="modal-btn-submit" type="submit" disabled={enviando}>
                {enviando
                  ? 'Procesando...'
                  : modoEdicion ? '💾 Guardar cambios' : '✚ Registrar'
                }
              </button>
            </form>

          </div>
        </div>
      )}

    </div>

  );
}
