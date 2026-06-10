import { useEffect, useState } from 'react';
import './GestorReservas.css';

const GestorReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [reservaEditando, setReservaEditando] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    const cargarReservas = () => {
        fetch('http://localhost:8080/api/reservas')
            .then(res => res.json())
            .then(data => setReservas(data))
            .catch(err => console.error("Error al cargar:", err));
    };

    useEffect(() => { cargarReservas(); }, []);

    // Preparar los datos para editar (Combina fecha y hora)
    const iniciarEdicion = (reserva) => {
        const fechaCombinada = `${reserva.fecha}T${reserva.hora.substring(0, 5)}`;
        setReservaEditando({
            ...reserva,
            fechaCompleta: fechaCombinada,
            mesaId: reserva.mesa?.id || ""
        });
    };

    const guardarEdicion = (e) => {
        e.preventDefault();
        
        // Separa de nuevo para cumplir con el formato de tu backend
        const [fecha, hora] = reservaEditando.fechaCompleta.split('T');

        const datosActualizados = {
            fecha: fecha,
            hora: hora.length === 5 ? hora + ":00" : hora,
            estadoReserva: reservaEditando.estadoReserva,
            observaciones: reservaEditando.observaciones,
            mesa: { id: parseInt(reservaEditando.mesaId) }
        };

        fetch(`http://localhost:8080/api/reservas/${reservaEditando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        })
        .then(response => {
            if (!response.ok) throw new Error("Error en la actualización");
            return response.json();
        })
        .then(() => {
            setReservaEditando(null);
            cargarReservas();
        })
        .catch(err => console.error("Error al guardar:", err));
    };

    const cambiarEstado = (id, nuevoEstado) => {
        fetch(`http://localhost:8080/api/reservas/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        }).then(() => cargarReservas());
    };

    // Lógica de filtrado por código
    const reservasFiltradas = reservas.filter(r => 
        r.codigoReserva.toLowerCase().includes(busqueda.toLowerCase())
    );

    const eliminarReserva = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta reserva?")) {
        fetch(`http://localhost:8080/api/reservas/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                cargarReservas(); // Recarga la tabla tras eliminar
            } else {
                alert("Error al eliminar la reserva");
            }
        })
        .catch(err => console.error("Error:", err));
    }
};

    return (
        <div className="gestor-reservas-wrapper">
            <h2 className="gestor-titulo">Gestión de Reservas - La Panchita</h2>
            
            <input 
                type="text" 
                placeholder="Buscar por código (ej: RES-123)..." 
                className="input-filtro"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ marginBottom: '15px', padding: '8px', width: '250px' }}
            />
            
            <table className="tabla-reservas-panchita">
                <thead>
                    <tr><th>Código</th><th>Cliente</th><th>Mesa</th><th>Estado</th><th>Pago</th><th>Acción</th></tr>
                </thead>
                <tbody>
                    {reservasFiltradas.map(r => (
                        <tr key={r.id}>
                            <td>{r.codigoReserva}</td>
                            <td>{r.usuario?.nombre}</td>
                            <td>{r.mesa?.numero || 'N/A'}</td>
                            <td><span className={`badge badge-${r.estadoReserva?.toLowerCase()}`}>{r.estadoReserva}</span></td>
                            <td>
                                {r.estadoPago === 'pendiente' ? (
                                    <button className="btn-pago" onClick={() => cambiarEstado(r.id, 'pagado')}>💰 Pagar</button>
                                ) : (
                                    <span className="badge badge-pagado">{r.estadoPago}</span>
                                )}
                            </td>
                            <td>
                                <button className="btn-accion" onClick={() => iniciarEdicion(r)}>✏️ Editar</button>
                                <button 
                                className="btn-accion" onClick={() => eliminarReserva(r.id)} style={{ marginLeft: '5px', backgroundColor: '#ff4d4d', color: 'white' }} >
                                    🗑️ Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {reservaEditando && (
                <div className="modal-overlay">
                    <form className="modal-contenido" onSubmit={guardarEdicion}>
                        <h3>Editar Reserva: {reservaEditando.codigoReserva}</h3>
                        
                        <label>Fecha y Hora:</label>
                        <input 
                            type="datetime-local" 
                            value={reservaEditando.fechaCompleta} 
                            onChange={e => setReservaEditando({...reservaEditando, fechaCompleta: e.target.value})} 
                        />

                        <label>Mesa ID:</label>
                        <input 
                            type="number"
                            value={reservaEditando.mesaId || ""} 
                            onChange={e => setReservaEditando({...reservaEditando, mesaId: e.target.value})}
                        />

                        <label>Estado Reserva:</label>
                        <select value={reservaEditando.estadoReserva} onChange={e => setReservaEditando({...reservaEditando, estadoReserva: e.target.value})}>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="asistió">Asistió</option>
                        </select>

                        <label>Observaciones:</label>
                        <textarea 
                            value={reservaEditando.observaciones || ''} 
                            onChange={e => setReservaEditando({...reservaEditando, observaciones: e.target.value})} 
                        />

                        <div className="modal-botones">
                            <button type="submit" className="btn-pago">Guardar Cambios</button>
                            <button type="button" className="btn-accion" onClick={() => setReservaEditando(null)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default GestorReservas;