import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ReportesVentas.css';
import { apiFetch } from './api';

const PERIODOS = [
  { valor: 'diario',  etiqueta: 'Diario (14 días)' },
  { valor: 'semanal', etiqueta: 'Semanal (8 semanas)' },
  { valor: 'mensual', etiqueta: 'Mensual (6 meses)' },
];

export default function ReportesVentas() {
  const [periodo, setPeriodo] = useState('diario');
  const [ventas, setVentas] = useState([]);
  const [platosVendidos, setPlatosVendidos] = useState([]);
  const [consumoInsumos, setConsumoInsumos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarVentas = async (p) => {
    try {
      const res = await apiFetch(`/api/reportes/ventas?periodo=${p}`);
      if (!res.ok) throw new Error('Error al cargar ventas');
      setVentas(await res.json());
    } catch (err) {
      console.error(err);
      setVentas([]);
    }
  };

  const cargarPlatosVendidos = async () => {
    try {
      const res = await apiFetch('/api/reportes/platos-mas-vendidos?limite=10');
      if (!res.ok) throw new Error('Error al cargar platos más vendidos');
      setPlatosVendidos(await res.json());
    } catch (err) {
      console.error(err);
      setPlatosVendidos([]);
    }
  };

  const cargarConsumoInsumos = async () => {
    try {
      const res = await apiFetch('/api/reportes/consumo-insumos');
      if (!res.ok) throw new Error('Error al cargar consumo de insumos');
      setConsumoInsumos(await res.json());
    } catch (err) {
      console.error(err);
      setConsumoInsumos([]);
    }
  };

  useEffect(() => {
    setCargando(true);
    Promise.all([cargarPlatosVendidos(), cargarConsumoInsumos()]).finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargarVentas(periodo); }, [periodo]);

  const totalPeriodo = ventas.reduce((s, v) => s + (v.totalGeneral || 0), 0);
  const totalPedidosPeriodo = ventas.reduce((s, v) => s + (v.cantidadPedidos || 0), 0);

  return (
    <div className="reportes-wrapper">
      <div className="reportes-header">
        <span className="reportes-eyebrow">Restaurante Panchita</span>
        <h2 className="reportes-titulo">Reportes de Ventas</h2>
        <div className="reportes-separador" />
      </div>

      {/* ── VENTAS POR PERIODO ── */}
      <section className="reportes-seccion">
        <div className="reportes-seccion__header">
          <h3>Ventas</h3>
          <div className="reportes-periodo-tabs">
            {PERIODOS.map(p => (
              <button
                key={p.valor}
                className={`reportes-tab ${periodo === p.valor ? 'activo' : ''}`}
                onClick={() => setPeriodo(p.valor)}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="reportes-kpis">
          <div className="reportes-kpi">
            <span className="reportes-kpi__val">S/ {totalPeriodo.toFixed(2)}</span>
            <span className="reportes-kpi__lbl">Total del periodo (reservas + delivery)</span>
          </div>
          <div className="reportes-kpi">
            <span className="reportes-kpi__val">{totalPedidosPeriodo}</span>
            <span className="reportes-kpi__lbl">Pedidos y reservas</span>
          </div>
        </div>

        <div className="reportes-chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ventas} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} interval={periodo === 'diario' ? 1 : 0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `S/ ${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="totalReservas" name="Reservas" stackId="a" fill="#D4A84B" />
              <Bar dataKey="totalDelivery" name="Delivery" stackId="a" fill="#C0392B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="reportes-cols">
        {/* ── PLATOS MÁS VENDIDOS ── */}
        <section className="reportes-seccion">
          <h3>Platos más vendidos</h3>
          <p className="reportes-nota">Últimos 30 días, según los pedidos de delivery registrados.</p>
          {platosVendidos.length === 0 && !cargando && (
            <p className="reportes-vacio">Todavía no hay ventas registradas con platos vinculados.</p>
          )}
          <div className="reportes-tabla">
            {platosVendidos.map((p, i) => (
              <div key={p.platoId} className="reportes-fila">
                <span className="reportes-fila__rank">#{i + 1}</span>
                <div className="reportes-fila__info">
                  <span className="reportes-fila__nombre">{p.nombre}</span>
                  <span className="reportes-fila__cat">{p.categoria}</span>
                </div>
                <span className="reportes-fila__cant">{p.cantidadVendida} vendidos</span>
                <span className="reportes-fila__total">S/ {p.totalIngresos?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONSUMO DE INSUMOS ── */}
        <section className="reportes-seccion">
          <h3>Consumo de insumos</h3>
          <p className="reportes-nota">Últimos 30 días, según los movimientos de inventario tipo "consumo".</p>
          {consumoInsumos.length === 0 && !cargando && (
            <p className="reportes-vacio">Todavía no hay consumos registrados en Inventario.</p>
          )}
          <div className="reportes-tabla">
            {consumoInsumos.map(c => (
              <div key={c.productoId} className="reportes-fila">
                <div className="reportes-fila__info">
                  <span className="reportes-fila__nombre">{c.nombre}</span>
                </div>
                <span className="reportes-fila__cant">{Number(c.cantidadConsumida).toFixed(2)} {c.unidadMedida}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
