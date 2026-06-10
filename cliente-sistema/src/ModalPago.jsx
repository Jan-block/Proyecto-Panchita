import React, { useState } from 'react';
import './ModalPago.css'; 

export default function ModalPago({ isOpen, onClose, metodoPago, montoGarantia, onConfirmar }) {
  // Estado para capturar el número de operación de Yape/Plin
  const [codigoOperacion, setCodigoOperacion] = useState('');
  // Estado para simular la carga/procesamiento del pago
  const [procesando, setProcesando] = useState(false);

  // Si el modal está cerrado, no renderiza nada
  if (!isOpen) return null;

  const manejarEnvioPago = (e) => {
    e.preventDefault();
    setProcesando(true);

    // Simulamos un retraso de red de 1.5 segundos para que parezca una pasarela real
    setTimeout(() => {
      setProcesando(false);

      // Estructuramos la respuesta según el método elegido
      let respuestaPago = {
        codigoOperacion: 'EFECTIVO-LOCAL',
        estadoPago: 'PENDIENTE'
      };

      if (metodoPago === 'yape_plin' || metodoPago === 'Yape/Plin') {
        respuestaPago = {
          codigoOperacion: codigoOperacion || 'YAPE-MOCK',
          estadoPago: 'PENDIENTE_VERIFICACION' // El admin lo aprueba en su panel
        };
      } else if (metodoPago === 'tarjeta' || metodoPago === 'Tarjeta') {
        respuestaPago = {
          codigoOperacion: 'TRANS-' + Math.floor(Math.random() * 900000 + 100000),
          estadoPago: 'APROBADO' // Pago automático aprobado
        };
      }

      // Devolvemos los datos al formulario padre y limpiamos el estado
      onConfirmar(respuestaPago);
      setCodigoOperacion('');
    }, 1500);
  };

  return (
    <div className="modal-pago-overlay">
      <div className="modal-pago-card animate-slide-down">
        
        {/* Cabecera del Modal */}
        <div className="modal-pago-header">
          <h3>🔒 Procesar Garantía de Reserva</h3>
          <button type="button" className="btn-cerrar-modal" onClick={onClose} disabled={procesando}>
            &times;
          </button>
        </div>

        {/* Cuerpo del Formulario del Modal */}
        <form onSubmit={manejarEnvioPago} className="modal-pago-body">
          
          <div className="alerta-monto-garntia">
            <span>Monto a garantizar:</span>
            <strong>S/ {montoGarantia.toFixed(2)}</strong>
          </div>

          {/* CASO 1: YAPE O PLIN */}
{(metodoPago === 'yape_plin' || metodoPago === 'Yape/Plin') && (
  <div className="contenedor-metodo-especifico">
    <span className="badge-metodo badge-yape">Yape / Plin</span>
    <p className="instrucciones-pago">
      Escanea este QR para transferir tu garantía al <strong>987 654 321</strong>.
    </p>
    
    {/* 🌟 INTEGRACIÓN DINÁMICA DEL QR */}
    <div className="qr-box">
      <img 
        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=987654321" 
        alt="QR La Panchita" 
        className="img-qr-dinamico" 
      />
    </div>

    <div className="grupo-input-modal">
      <label>Ingresa el Número de Operación:</label>
      <input 
        type="text" 
        placeholder="Ej: 485932" 
        required 
        value={codigoOperacion}
        onChange={(e) => setCodigoOperacion(e.target.value)}
        disabled={procesando}
      />
    </div>
  </div>
)}

          {/* CASO 2: TARJETA DE CRÉDITO O DÉBITO */}
          {(metodoPago === 'tarjeta' || metodoPago === 'Tarjeta') && (
           <div className="contenedor-metodo-especifico">
  <span className="badge-metodo badge-yape">Yape / Plin</span>
  <p className="instrucciones-pago">
    Escanea el código QR desde tu app o transfiere al <strong>987 654 321</strong>.
  </p>
  
  {/* Aquí va tu imagen del QR */}
  <div className="qr-box">
    <img src="/ruta-a-tu-imagen-qr.png" alt="QR La Panchita" className="img-qr-dinamico" />
  </div>

  <div className="grupo-input-modal">
    <label>Número de Operación (Transacción):</label>
    <input 
      type="text" 
      placeholder="Ej: 485932" 
      required 
      value={codigoOperacion}
      onChange={(e) => setCodigoOperacion(e.target.value)}
    />
  </div>
</div>
          )}

          {/* CASO 3: EFECTIVO */}
          {(metodoPago === 'efectivo' || metodoPago === 'Efectivo') && (
            <div className="contenedor-metodo-especifico caja-aviso-efectivo">
              <span className="badge-metodo badge-efectivo">Pago Presencial</span>
              <h4>⚠️ Política de Espera Obligatoria</h4>
              <p>
                No necesitas pagar ahora en la web. Abonarás los <strong>S/ {montoGarantia.toFixed(2)}</strong> directamete en la caja del restaurante cuando te presentes.
              </p>
              <div className="nota-advertencia-efectivo">
                <strong>Importante:</strong> Tu mesa asignada se reservará por un margen de <strong>15 minutos de tolerancia</strong> respecto a tu hora elegida. Pasado ese tiempo, el sistema liberará la mesa automáticamente de manera operativa.
              </div>
            </div>
          )}

          {/* Acciones de Control Inferiores */}
          <div className="modal-pago-foot-actions">
            <button 
              type="button" 
              className="btn-modal-cancelar" 
              onClick={onClose} 
              disabled={procesando}
            >
              Regresar
            </button>
            <button 
              type="submit" 
              className="btn-modal-confirmar-final" 
              disabled={procesando}
            >
              {procesando ? 'Verificando...' : 'Completar Reservación'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}