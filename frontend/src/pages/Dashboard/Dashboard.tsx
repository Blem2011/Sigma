import { useState, useEffect } from 'react';
import Usuarios from './sub-modules/Usuarios';
import Clientes from './sub-modules/Clientes';
import Proveedores from './sub-modules/Proveedores';
import Materiales from './sub-modules/Materiales';
import Compras from './sub-modules/Compras';
import Obras from './sub-modules/Obras';
import Consumos from './sub-modules/Consumos';
import Empleados from './sub-modules/Empleados';
import Asistencias from './sub-modules/Asistencias';
import './Dashboard.css';

import logoBrand from '../../assets/logo.png';

interface DashboardProps {
  user: { usuario: string; rol: string };
  onLogout: () => void;
}

type ModulosDisponibles = 'dashboard' | 'usuarios' | 'clientes' | 'proveedores' | 'materiales' | 'compras' | 'obras' | 'consumos' | 'empleados' | 'asistencias';

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [moduloActivo, setModuloActivo] = useState<ModulosDisponibles>('dashboard');
  const [modoClaro, setModoClaro] = useState<boolean>(false);

  // 🔔 Estados para el control y guardado de alertas operativas
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState<boolean>(false);
  const [notificaciones, setNotificaciones] = useState<string[]>([]);
  // 🕒 NUEVO: Estado para guardar la hora real de tu PC
  const [horaReal, setHoraReal] = useState<string>('');

  // 🕒 NUEVO: Efecto para actualizar la hora cada 1 segundo automáticamente
  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      // 🕒 Quitamos 'second' para mostrar solo la hora y los minutos de tu PC
      setHoraReal(ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    };

    actualizarReloj(); // Ejecuta al cargar el componente
    const intervalo = setInterval(actualizarReloj, 1000); // Actualiza cada 1000ms (1 segundo)

    return () => clearInterval(intervalo); // Limpia el proceso al salir
  }, []);

    // 🔔 NUEVO: Efecto exclusivo para cargar las alertas operativas del sistema
  const cargarAlertasDelSistema = async () => {
    try {
      const alertasActuales: string[] = [];

      // A. Filtrar insumos con Stock menor o igual al mínimo
      const resMat = await axios.get('https://sigma-production-e9dc.up.railway.app/api/materiales');
      resMat.data.forEach((m: any) => {
        if (Number(m.cantidad) <= Number(m.stock_minimo)) {
          alertasActuales.push(`⚠️ Stock crítico: ${m.nombre} quedará sin insumos en depósito.`);
        }
      });

      // B. Filtrar proyectos de Obras que estén detenidos
      const resObras = await axios.get('https://sigma-production-e9dc.up.railway.app/api/obras');
      resObras.data.forEach((o: any) => {
        if (o.estado === 'Pausada') {
          alertasActuales.push(`🏗️ Obra detenida: El proyecto "${o.nombre}" se encuentra pausado.`);
        }
      });

      // C. Filtrar incidencias de presentismo del día de hoy
      const resAsis = await axios.get('https://sigma-production-e9dc.up.railway.app/api/asistencias');
      const hoyISO = new Date().toISOString().substring(0, 10);
      resAsis.data.forEach((a: any) => {
        const fechaAsis = a.fecha.substring(0, 10);
        if (fechaAsis === hoyISO && (a.estado === 'Ausente' || a.estado === 'Tardanza')) {
          alertasActuales.push(`⏱️ Personal: ${a.empleado_nombre} registró "${a.estado}" en la jornada de hoy.`);
        }
      });

      setNotificaciones(alertasActuales);
    } catch (err) {
      console.error('Error al sincronizar alertas de la campanita:', err);
    }
  };

  // Disparar el recuento automático cada vez que el usuario navega o cambia de pestaña
  useEffect(() => {
    cargarAlertasDelSistema();
  }, [moduloActivo]);
  

  const tienePermiso = (modulo: ModulosDisponibles): boolean => {
    if (modulo === 'dashboard') return true;
    if (user.rol === 'admin') return true;

    switch (user.rol) {
      case 'compras':
        return ['proveedores', 'materiales', 'compras'].includes(modulo);
      case 'almacen':
        return ['materiales', 'consumos'].includes(modulo);
      case 'ventas':
        return ['clientes', 'obras'].includes(modulo);
      case 'obras':
        return ['obras'].includes(modulo);
      case 'rrhh':
        return ['empleados', 'asistencias'].includes(modulo);
      default:
        return false;
    }
  };

  return (
    <div className={`dashboard-layout ${modoClaro ? 'claro' : ''}`}>
      
      {/* BARRA NAV LATERAL FIJA */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <img src={logoBrand} alt="SIGMA" className="sidebar-logo" />
            <div className="sidebar-brand-text">
              <h2>SIGMA</h2>
              <span>CONSTRUCTORA</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button onClick={() => setModuloActivo('dashboard')} className={`sidebar-item ${moduloActivo === 'dashboard' ? 'active' : ''}`}>
              🏠 Dashboard
            </button>
            
            {tienePermiso('usuarios') && (
              <button onClick={() => setModuloActivo('usuarios')} className={`sidebar-item ${moduloActivo === 'usuarios' ? 'active' : ''}`}>
                ⚙️ Usuarios
              </button>
            )}

            {tienePermiso('empleados') && (
              <button onClick={() => setModuloActivo('empleados')} className={`sidebar-item ${moduloActivo === 'empleados' ? 'active' : ''}`}>
                👥 Personal Obreros
              </button>
            )}

            {tienePermiso('clientes') && (
              <button onClick={() => setModuloActivo('clientes')} className={`sidebar-item ${moduloActivo === 'clientes' ? 'active' : ''}`}>
                🤝 Clientes
              </button>
            )}

            {tienePermiso('proveedores') && (
              <button onClick={() => setModuloActivo('proveedores')} className={`sidebar-item ${moduloActivo === 'proveedores' ? 'active' : ''}`}>
                📦 Proveedores
              </button>
            )}

            {tienePermiso('materiales') && (
              <button onClick={() => setModuloActivo('materiales')} className={`sidebar-item ${moduloActivo === 'materiales' ? 'active' : ''}`}>
                🧱 Stock / Almacén
              </button>
            )}

            {tienePermiso('compras') && (
              <button onClick={() => setModuloActivo('compras')} className={`sidebar-item ${moduloActivo === 'compras' ? 'active' : ''}`}>
                🛒 Compras
              </button>
            )}

            {tienePermiso('obras') && (
              <button onClick={() => setModuloActivo('obras')} className={`sidebar-item ${moduloActivo === 'obras' ? 'active' : ''}`}>
                🏗️ Obras
              </button>
            )}

            {tienePermiso('consumos') && (
              <button onClick={() => setModuloActivo('consumos')} className={`sidebar-item ${moduloActivo === 'consumos' ? 'active' : ''}`}>
                📉 Salida a Obra
              </button>
            )}

            {tienePermiso('asistencias') && (
              <button onClick={() => setModuloActivo('asistencias')} className={`sidebar-item ${moduloActivo === 'asistencias' ? 'active' : ''}`}>
                ⏱️ Control Horario
              </button>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <h4>SIGMA Constructora</h4>
          <p>Construyendo el futuro con precisión.</p>
        </div>
      </aside>

      {/* PANEL DE CONTENIDO PRINCIPAL */}
      <div className="main-content">
        
        {/* CABECERA SUPERIOR */}
        <header className="main-header">
          <div className="header-welcome">
            <h3>¡Bienvenido de vuelta, {user.usuario}! 👋</h3>
            <span>Panel administrativo - Control integral de obras y personal</span>
          </div>

          <div className="header-user-profile">
            <div className="header-widgets">
              
              {/* INTERFAZ DEL SWITCH DE TEMA */}
              <div className="theme-switch-wrapper">
                <span className="switch-icon">{modoClaro ? '🌙' : '☀️'}</span>
                <button 
                  onClick={() => setModoClaro(!modoClaro)} 
                  className={`theme-toggle-switch ${modoClaro ? 'claro-activo' : ''}`}
                  title={modoClaro ? "Modo Oscuro" : "Modo Claro"}
                >
                  <span className="switch-circle"></span>
                </button>
              </div>
              
              {/* 🕒 RELOJ LOCAL EN TIEMPO REAL */}
              <span>🕒 {horaReal || 'Cargando hora...'}</span>

              {/* 🔔 COMPONENTE DE LA CAMPANITA INTERACTIVA DINÁMICA */}
              <div className="notification-bell-container">
                <button 
                  onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)} 
                  className="btn-bell-toggle" 
                  title="Ver notificaciones"
                >
                  🔔 {notificaciones.length > 0 && <span className="bell-badge">{notificaciones.length}</span>}
                </button>

                {/* Menú desplegable flotante condicional */}
                {mostrarNotificaciones && (
                  <div className="notifications-dropdown">
                    <h4>Notificaciones Operativas</h4>
                    <div className="notifications-list">
                      {notificaciones.length === 0 ? (
                        <div className="notification-empty">✓ No hay alertas críticas en el sistema.</div>
                      ) : (
                        notificaciones.map((notif, index) => (
                          <div key={index} className="notification-item">{notif}</div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="user-badge-container">
              <div className="user-avatar-placeholder">👨‍💼</div>
              <div className="user-text-meta">
                <span className="username">{user.usuario}</span>
                <span className="role">{user.rol}</span>
              </div>
              <button onClick={onLogout} className="btn-header-logout" title="Cerrar Sesión">❌</button>
            </div>
          </div>
        </header>


        {/* CONTENEDOR MODULAR */}
        <main>
          {moduloActivo === 'dashboard' && (
            <div>
              <div className="welcome-banner-info">
                <h3>Estructura Principal SIGMA Habilitada</h3>
                <p>Seleccioná cualquiera de las secciones en el menú lateral de la izquierda para desplegar sus respectivos formularios y listados dinámicos de la base de datos.</p>
              </div>
            </div>
          )}

          {moduloActivo === 'usuarios' && tienePermiso('usuarios') && <Usuarios />}
          {moduloActivo === 'clientes' && tienePermiso('clientes') && <Clientes />}
          {moduloActivo === 'proveedores' && tienePermiso('proveedores') && <Proveedores />}
          {moduloActivo === 'materiales' && tienePermiso('materiales') && <Materiales />}
          {moduloActivo === 'compras' && tienePermiso('compras') && <Compras />}
          {moduloActivo === 'obras' && tienePermiso('obras') && <Obras />}
          {moduloActivo === 'consumos' && tienePermiso('consumos') && <Consumos />}
          {moduloActivo === 'empleados' && tienePermiso('empleados') && <Empleados />}
          {moduloActivo === 'asistencias' && tienePermiso('asistencias') && <Asistencias />}
        </main>
      </div>

    </div>
  );
}
