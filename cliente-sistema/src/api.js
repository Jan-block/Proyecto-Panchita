// Helper centralizado para llamadas al backend.
// Agrega automáticamente el header Authorization con el JWT guardado en localStorage,
// para no tener que repetirlo en cada componente.
 
export const API_BASE = 'http://localhost:8080';
 
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
 
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
 
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
 
  // Si el token venció o es inválido, el backend responde 401.
  // Limpiamos la sesión y mandamos al usuario de vuelta al login.
  if (res.status === 401) {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    window.location.reload();
  }
 
  return res;
}
 