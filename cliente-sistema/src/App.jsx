import React, { useState, useEffect } from 'react'; // 👈 Añadido useEffect
import AuthForm from './AuthForm';
import InicioRestaurante from './InicioRestaurante';
import SplashScreen from './SplashScreen';
import AdminDashboard from './AdminDashboard'; 
import './App.css';

function App() {
  
  const [vistaActual, setVistaActual] = useState(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    if (!token) return 'login';
    return rol === 'administrador' ? 'administrador' : 'inicio';
  });

  
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const userJson = localStorage.getItem('usuario');
    return userJson ? JSON.parse(userJson) : null;
  });

  const [inicioVisible, setInicioVisible] = useState(false);

  
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
    localStorage.clear(); 
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
