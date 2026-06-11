import React, { useState, useEffect } from 'react'; // 👈 Añadido useEffect
import AuthForm from './AuthForm';
import InicioRestaurante from './InicioRestaurante';
import SplashScreen from './SplashScreen';
import AdminDashboard from './AdminDashboard'; 
import './App.css';

function App() {
  // 1. Evalúa la sesión existente de forma robusta al cargar la página (F5)
  const [vistaActual, setVistaActual] = useState(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    if (!token) return 'login';
    return rol === 'administrador' ? 'administrador' : 'inicio';
  });

  // Estado dinámico que almacena el objeto de usuario con su ID correspondiente
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const userJson = localStorage.getItem('usuario');
    return userJson ? JSON.parse(userJson) : null;
  });

  const [inicioVisible, setInicioVisible] = useState(false);

  // 🌟 NUEVO: Si el usuario ya estaba en el inicio tras un F5, fuerza su visibilidad instantáneamente
  useEffect(() => {
    if (vistaActual === 'inicio') {
      setInicioVisible(true);
    }
  }, [vistaActual]);

  // 2. Captura el objeto completo enviado desde AuthForm al loguearse con éxito
  const handleLoginExitoso = (infoUsuario, tokenRecibido) => {
    setUsuarioLogueado(infoUsuario);
    setVistaActual('splash'); // Pasa primero por el SplashScreen decorativo
  };

  // 3. Al terminar el Splash, redirecciona según el Rol de la BD
  const handleSplashFinish = () => {
    if (usuarioLogueado?.rol === 'administrador') {
      setVistaActual('administrador');
    } else {
      setVistaActual('inicio');
      setTimeout(() => { setInicioVisible(true); }, 50);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.clear(); // Limpia token, usuario, nombre y rol de golpe
    setUsuarioLogueado(null);
    setInicioVisible(false);
    setVistaActual('login');
  };

  return (
    <>
      {vistaActual === 'login' && (
        <AuthForm onLoginSuccess={handleLoginExitoso} />
      )}
      
      {vistaActual === 'splash' && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}
      
      {vistaActual === 'inicio' && (
        <div className={`inicio-animado ${inicioVisible ? 'inicio-visible' : ''}`}>
          {/* 🌟 ENVIAMOS EL OBJETO COMPLETO: Ahora InicioRestaurante y FormularioReserva tendrán el ID disponible siempre */}
          <InicioRestaurante usuarioLogueado={usuarioLogueado} onLogout={handleCerrarSesion} />
        </div>
      )}

      {vistaActual === 'administrador' && (
        <AdminDashboard usuarioLogueado={usuarioLogueado} onLogout={handleCerrarSesion} />
      )}
    </>
  );
}

export default App;
