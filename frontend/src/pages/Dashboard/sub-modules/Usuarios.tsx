import { useState, useEffect } from 'react';
import axios from 'axios';
import './Usuarios.css';

interface Usuario {
  id: number;
  nombre_completo: string;
  usuario: string;
  rol: 'admin' | 'compras' | 'almacen' | 'ventas' | 'obras';
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Estados del Formulario único
  const [nombreForm, setNombreForm] = useState('');
  const [userForm, setUserForm] = useState('');
  const [passForm, setPassForm] = useState('');
  const [rolForm, setRolForm] = useState('obras');
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });

  // NUEVO: Estado para saber si estamos editando un usuario existente
  const [idUsuarioEditando, setIdUsuarioEditando] = useState<number | null>(null);

  const cargarUsuarios = () => {
    axios.get<Usuario[]>('http://localhost:5000/api/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error('Error al cargar lista:', err));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para procesar tanto la creación como la edición
  const guardarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    if (idUsuarioEditando) {
      // MODO EDICIÓN (PUT)
      axios.put(`http://localhost:5000/api/usuarios/${idUsuarioEditando}`, {
        nombre_completo: nombreForm,
        usuario: userForm,
        password: passForm, // Puede ir vacío
        rol: rolForm
      })
      .then(res => {
        setMensaje({ texto: res.data.mensaje, esError: false });
        cancelarEdicion();
        cargarUsuarios();
      })
      .catch(err => {
        setMensaje({ texto: err.response?.data?.error || 'Error al actualizar', esError: true });
      });
    } else {
      // MODO CREACIÓN (POST)
      if (!passForm) return setMensaje({ texto: 'La contraseña es obligatoria', esError: true });
      
      axios.post('http://localhost:5000/api/usuarios', {
        nombre_completo: nombreForm,
        usuario: userForm,
        password: passForm,
        rol: rolForm
      })
      .then(res => {
        setMensaje({ texto: res.data.mensaje, esError: false });
        limpiarFormulario();
        cargarUsuarios();
      })
      .catch(err => {
        setMensaje({ texto: err.response?.data?.error || 'Error al guardar', esError: true });
      });
    }
  };

  // NUEVO: Cargar los datos del renglón elegido en el formulario para editar
  const activarEdicion = (u: Usuario) => {
    setIdUsuarioEditando(u.id);
    setNombreForm(u.nombre_completo);
    setUserForm(u.usuario);
    setPassForm(''); // Se deja vacío por si no se quiere cambiar la clave
    setRolForm(u.rol);
    setMensaje({ texto: '', esError: false });
  };

  // NUEVO: Borrar un usuario confirmando la acción primero
  const eliminarUsuario = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que querés eliminar a ${nombre}?`)) {
      axios.delete(`http://localhost:5000/api/usuarios/${id}`)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          if (idUsuarioEditando === id) cancelarEdicion();
          cargarUsuarios();
        })
        .catch(err => {
          setMensaje({ texto: err.response?.data?.error || 'Error al eliminar', esError: true });
        });
    }
  };

  const limpiarFormulario = () => {
    setNombreForm('');
    setUserForm('');
    setPassForm('');
    setRolForm('obras');
  };

  const cancelarEdicion = () => {
    setIdUsuarioEditando(null);
    limpiarFormulario();
  };

  return (
    <div className="usuarios-modulo-container">
      {/* FORMULARIO */}
      <div className="usuarios-card">
        <h3>{idUsuarioEditando ? '✏️ Editar Usuario' : '⚙️ Crear Nuevo Usuario'}</h3>
        <form onSubmit={guardarUsuario}>
          <div className="input-field-group">
            <label>Nombre Completo</label>
            <input type="text" value={nombreForm} onChange={e => setNombreForm(e.target.value)} required placeholder="Juan Pérez" />
          </div>
          <div className="input-field-group">
            <label>Nombre de Usuario</label>
            <input type="text" value={userForm} onChange={e => setUserForm(e.target.value)} required placeholder="juan_compras" />
          </div>
          <div className="input-field-group">
            <label>Contraseña {idUsuarioEditando && '(Dejar en blanco para no modificar)'}</label>
            <input type="password" value={passForm} onChange={e => setPassForm(e.target.value)} placeholder="••••••••" required={!idUsuarioEditando} />
          </div>
          <div className="input-field-group">
            <label>Rol / Área</label>
            <select value={rolForm} onChange={e => setRolForm(e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="compras">Compras</option>
              <option value="almacen">Almacén / Stock</option>
              <option value="ventas">Ventas</option>
              <option value="obras">Obras / Proyectos</option>
              <option value="rrhh">Recursos Humanos (RRHH)</option>
            </select>
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar">
            {idUsuarioEditando ? 'Actualizar Datos' : 'Registrar en el Sistema'}
          </button>
          
          {idUsuarioEditando && (
            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">
              Cancelar Edición
            </button>
          )}
        </form>
      </div>

      {/* TABLA */}
      <div className="usuarios-card">
        <h3>👥 Personal Registrado</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th className="acciones-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.nombre_completo}</td>
                <td>{u.usuario}</td>
                <td>
                  <span className={`badge-rol ${u.rol === 'admin' ? 'badge-admin' : 'badge-otros'}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="acciones-cell">
                  <button onClick={() => activarEdicion(u)} className="btn-editar-tabla">Editar</button>
                  <button onClick={() => eliminarUsuario(u.id, u.nombre_completo)} className="btn-eliminar-tabla">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
