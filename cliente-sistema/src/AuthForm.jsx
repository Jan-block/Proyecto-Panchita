import React, { useState } from 'react';
import './AuthForm.css';
import logoPanchita from './assets/panchita.png';

const IconUser = () => (
  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconArrow = () => (
  <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const IconSpinner = () => (
  <svg className="spin" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const IconCheck = () => (
  <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconPhone = () => (
  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);


function Field({ icon, type, name, placeholder, value, onChange, required, autoComplete }) {
  return (
    <div className="auth-field">
      <span className="auth-field__icon">{icon}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

export default function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ nombre: '', email: '', password: '', telefono: '',codigoSecreto: '' });

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const switchMode = (login) => {
    if (isLogin === login) return;
    setIsLogin(login);
    setError('');
    setIsSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue por completo
    setError('');
    setIsSuccess(false);

    // ── CORRECCIÓN AQUÍ: FLUJO ESTRUCTURADO SIN INTERRUPCIONES BRUSCAS ──
    if (!isLogin) {
      const regexTelefono = /^[0-9]{7,9}$/;
      if (!regexTelefono.test(registerData.telefono)) {
        setError('El número de teléfono debe contener entre 7 y 9 dígitos.');
        return;
      }
      if (registerData.password.trim().length < 6) {
        setError('La contraseña de registro debe tener como mínimo 6 caracteres.');
        return;
      }
    } else {
      if (!loginData.email.trim() || !loginData.password.trim()) {
        setError('Por favor, ingresa tu correo y contraseña.');
        return;
      }
    }

    // Si pasa todas las validaciones anteriores con éxito, recién activa el cargando
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? loginData : registerData;

    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
                 if (res.ok) {
        const nombre = isLogin ? data.nombre : registerData.nombre;
        const rol = data.rol || 'cliente'; 
        const idUsuario = data.id || null; // Ahora permitimos que sea null
        if (!idUsuario) {
    console.error("ERROR CRÍTICO: El servidor no envió el ID del usuario. Respuesta recibida:", data);
    setError("Error interno: No se pudo identificar tu cuenta.");
    return; // Detenemos la ejecución aquí
}
        const tokenSesion = data.token || 'sesion_activa_panchita';

        // Creamos un objeto limpio de usuario para la sesión
        const infoUsuario = { id: idUsuario, nombre: nombre, rol: rol };

        // Guardamos todo en el localStorage de forma segura como texto JSON
        localStorage.setItem('usuario', JSON.stringify(infoUsuario));
        localStorage.setItem('token', tokenSesion);
        localStorage.setItem('rol', rol);
        localStorage.setItem('nombre', nombre);
        
        setIsSuccess(true);
        
        setTimeout(() => {
          // Le pasamos el objeto completo a App.jsx
          onLoginSuccess(infoUsuario, tokenSesion);
        }, 1500);
      } else {


        setError(data.message || 'Datos incorrectos. Intenta de nuevo.');
      }
    } catch {
      setError('No se pudo conectar al servidor.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        
        <div className="auth-deco" aria-hidden="true">
          <div className="deco-ring deco-ring--1" />
          <div className="deco-ring deco-ring--2" />
          <div className="deco-content">
            <p className="deco-logo">Panchita</p>
            <p className="deco-sub">Restaurante</p>
            <img src={logoPanchita} alt="Logo Panchita" className="deco-image" />
            <div className="deco-divider" />
            <p className="deco-tagline">
              Reserva tu mesa o realiza tu pedido en línea con nosotros
            </p>
          </div>
        </div>

        <div className="auth-form-panel">
          {/* Tabs corregidas con type="button" */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => switchMode(true)}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => switchMode(false)}
            >
              Registrarse
            </button>
          </div>

          <h2 className="auth-title">
            {isLogin ? '¡Bienvenido de vuelta!' : 'Crea tu cuenta'}
          </h2>
          <p className="auth-hint">
            {isLogin
              ? 'Ingresa para ver tus reservas y pedidos'
              : 'Regístrate para hacer reservas y pedidos en línea'}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Campo nombre animado */}
            <div className={`name-slide ${!isLogin ? 'name-slide--open' : ''}`}>
              <div className="name-slide__inner">
                <Field
                  icon={<IconUser />}
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={registerData.nombre}
                  onChange={handleRegisterChange}
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Campo teléfono animado */}
            <div className={`name-slide ${!isLogin ? 'name-slide--open' : ''}`}>
              <div className="name-slide__inner">
                <Field
                  icon={<IconPhone />}
                  type="tel"
                  name="telefono"
                  placeholder="Número de teléfono"
                  value={registerData.telefono}
                  onChange={handleRegisterChange}
                  required={!isLogin}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* ── 🆕 AGREGAR ESTA PARTE AQUÍ ABAJO ── */}
            {/* Campo de Código Secreto Corporativo animado */}
            <div className={`name-slide ${!isLogin ? 'name-slide--open' : ''}`}>
              <div className="name-slide__inner">
                <Field
                  icon={<IconLock />}
                  type="password"
                  name="codigoSecreto"
                  placeholder="Código de autorización (Solo personal)"
                  value={registerData.codigoSecreto || ''}
                  onChange={(e) => setRegisterData({ ...registerData, codigoSecreto: e.target.value })}
                  required={false}
                  autoComplete="off"
                />
              </div>
            </div>
            {/* ── ⬆️ FIN DE LA NUEVA PARTE ── */}


            {/* Email */}
            <Field
              icon={<IconMail />}
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={isLogin ? loginData.email : registerData.email}
              onChange={isLogin ? handleLoginChange : handleRegisterChange}
              required
              autoComplete="email"
            />

            {/* Contraseña */}
            <Field
              icon={<IconLock />}
              type="password"
              name="password"
              placeholder="Contraseña"
              value={isLogin ? loginData.password : registerData.password}
              onChange={isLogin ? handleLoginChange : handleRegisterChange}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />

            {/* Mensaje de error */}
            {error && <p className="auth-error">{error}</p>}

            {/* Botón submit */}
            <button
              type="submit"
              className={`btn-main ${isSuccess ? 'btn-main--success' : ''}`}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <><IconSpinner /> Procesando...</>
              ) : isSuccess ? (
                <><IconCheck /> ¡Listo!</>
              ) : (
                <><IconArrow /> {isLogin ? 'Iniciar sesión' : 'Registrarse'}</>
              )}
            </button>
          </form>

          {/* Ornamento */}
          <div className="auth-ornament">
            <span className="orn-line" />
            <span className="orn-symbol">✦</span>
            <span className="orn-line" />
          </div>

          {/* Link para cambiar de modo */}
          <p className="auth-toggle">
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            {' '}
            <button type="button" onClick={() => switchMode(!isLogin)}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}