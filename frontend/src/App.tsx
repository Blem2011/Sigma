import { useState } from 'react';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

export default function App() {
  // Estado global para guardar el usuario que inició sesión
  const [userLogueado, setUserLogueado] = useState<{ usuario: string; rol: string } | null>(null);

  // Función para limpiar el estado y volver al login
  const salir = () => {
    setUserLogueado(null);
  };

  return (
    <>
      {userLogueado ? (
        <Dashboard user={userLogueado} onLogout={salir} />
      ) : (
        <Login onLoginSuccess={(user) => setUserLogueado(user)} />
      )}
    </>
  );
}
