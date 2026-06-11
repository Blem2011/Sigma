import { useState, useEffect } from 'react';
import axios from 'axios';
import './Obras.css';

interface Cliente { id: number; nombre: string; }
interface Obra {
  id: number;
  id_cliente: number;
  cliente_nombre: string;
  nombre: string;
  direccion: string;
  presupuesto: number;
  fecha_inicio: string;
  estado: 'Planificación' | 'En execution' | 'Pausada' | 'Finalizada';
}

export default function Obras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Estados del Formulario
  const [idCliente, setIdCliente] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [estado, setEstado] = useState('Planificación');

  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const cargarDatos = async () => {
    try {
      const [resObras, resClientes] = await Promise.all([
        axios.get<Obra[]>('https://sigma-production-e9dc.up.railway.app/api/obras'),
        axios.get<Cliente[]>('https://sigma-production-e9dc.up.railway.app/api/clientes')
      ]);
      setObras(resObras.data);
      setClientes(resClientes.data);
    } catch (err) {
      console.error('Error al sincronizar listas en módulo obras:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarObra = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    const datosObra = {
      id_cliente: Number(idCliente),
      nombre,
      direccion,
      presupuesto: Number(presupuesto),
      fecha_inicio: fechaInicio,
      estado
    };

    if (idEditando) {
      axios.put(`https://sigma-production-e9dc.up.railway.app/api/obras/${idEditando}`, datosObra)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          cancelarEdicion();
          cargarDatos();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al actualizar', esError: true }));
    } else {
      axios.post('https://sigma-production-e9dc.up.railway.app/api/obras', datosObra)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          limpiarFormulario();
          cargarDatos();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al guardar', esError: true }));
    }
  };

  const activarEdicion = (o: Obra) => {
    setIdEditando(o.id);
    setIdCliente(o.id_cliente.toString());
    setNombre(o.nombre);
    setDireccion(o.direccion);
    setPresupuesto(o.presupuesto.toString());
    // Formatear fecha de tipo ISO/MySQL a YYYY-MM-DD para el input date
    const fechaFormateada = o.fecha_inicio.substring(0, 10);
    setFechaInicio(fechaFormateada);
    setEstado(o.estado);
    setMensaje({ texto: '', esError: false });
  };

  const eliminarObra = (id: number, nombreObra: string) => {
    if (window.confirm(`¿Seguro que querés eliminar el proyecto: ${nombreObra}?`)) {
      axios.delete(`https://sigma-production-e9dc.up.railway.app/api/obras/${id}`)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          if (idEditando === id) cancelarEdicion();
          cargarDatos();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al eliminar', esError: true }));
    }
  };

  const limpiarFormulario = () => {
    setIdCliente('');
    setNombre('');
    setDireccion('');
    setPresupuesto('');
    setFechaInicio('');
    setEstado('Planificación');
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    limpiarFormulario();
  };

  // Helper para pintar la clase correcta del Badge en base al estado
  const obtenerClaseEstado = (est: string) => {
    if (est === 'En ejecución') return 'estado-ejecucion';
    if (est === 'Pausada') return 'estado-pausada';
    if (est === 'Finalizada') return 'estado-finalizada';
    return 'estado-planificacion';
  };

  return (
    <div className="obras-modulo-container">
      {/* FORMULARIO */}
      <div className="obras-card">
        <h3>{idEditando ? '✏️ Editar Proyecto' : '🏗️ Registrar Nueva Obra'}</h3>
        <form onSubmit={guardarObra}>
          <div className="input-field-group">
            <label>Cliente Titular</label>
            <select value={idCliente} onChange={e => setIdCliente(e.target.value)} required>
              <option value="">-- Seleccione el Cliente --</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="input-field-group">
            <label>Nombre del Proyecto / Obra</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Edificio San Luis I" />
          </div>
          <div className="input-field-group">
            <label>Ubicación / Dirección</label>
            <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} required placeholder="Calle y Nro" />
          </div>
          <div className="input-field-group">
            <label>Presupuesto Asignado ($)</label>
            <input type="number" step="0.01" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} required placeholder="0.00" />
          </div>
          <div className="input-field-group">
            <label>Fecha Estimada de Inicio</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
          </div>
          <div className="input-field-group">
            <label>Estado del Proyecto</label>
            <select value={estado} onChange={e => setEstado(e.target.value)}>
              <option value="Planificación">Planificación</option>
              <option value="En ejecución">En ejecución</option>
              <option value="Pausada">Pausada</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar" style={{ backgroundColor: '#4f46e5' }}>
            {idEditando ? 'Actualizar Proyecto' : 'Dar de Alta Obra'}
          </button>
          
          {idEditando && (
            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          )}
        </form>
      </div>

      {/* TABLA */}
      <div className="obras-card">
        <h3>📋 Registro Integrado de Obras</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Cliente</th>
              <th>Ubicación</th>
              <th>Presupuesto</th>
              <th>Estado</th>
              <th className="acciones-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {obras.map(o => (
              <tr key={o.id}>
                <td><strong>{o.nombre}</strong></td>
                <td>{o.cliente_nombre}</td>
                <td>{o.direccion}</td>
                <td>${Number(o.presupuesto).toLocaleString('es-AR')}</td>
                <td>
                  <span className={`badge-estado ${obtenerClaseEstado(o.estado)}`}>
                    {o.estado}
                  </span>
                </td>
                <td className="acciones-cell">
                  <button onClick={() => activarEdicion(o)} className="btn-editar-tabla">Editar</button>
                  <button onClick={() => eliminarObra(o.id, o.nombre)} className="btn-eliminar-tabla">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
