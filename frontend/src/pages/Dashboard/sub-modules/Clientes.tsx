import { useState, useEffect } from 'react';
import axios from 'axios';
import './Clientes.css';

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  cuit: string;
  direccion: string;
  tipo: 'persona' | 'empresa';
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cuit, setCuit] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipo, setTipo] = useState<'persona' | 'empresa'>('persona');
  
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const cargarClientes = () => {
    axios.get<Cliente[]>('http://localhost:5000/api/clientes')
      .then(res => setClientes(res.data))
      .catch(err => console.error('Error al cargar lista de clientes:', err));
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const guardarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    const datosCliente = { nombre, telefono, cuit, direccion, tipo };

    if (idEditando) {
      axios.put(`http://localhost:5000/api/clientes/${idEditando}`, datosCliente)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          cancelarEdicion();
          cargarClientes();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al actualizar', esError: true }));
    } else {
      axios.post('http://localhost:5000/api/clientes', datosCliente)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          limpiarFormulario();
          cargarClientes();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al guardar', esError: true }));
    }
  };

  const activarEdicion = (c: Cliente) => {
    setIdEditando(c.id);
    setNombre(c.nombre);
    setTelefono(c.telefono);
    setCuit(c.cuit);
    setDireccion(c.direccion);
    setTipo(c.tipo);
    setMensaje({ texto: '', esError: false });
  };

  const eliminarCliente = (id: number, nombreCliente: string) => {
    if (window.confirm(`¿Estás seguro de que querés eliminar al cliente: ${nombreCliente}?`)) {
      axios.delete(`http://localhost:5000/api/clientes/${id}`)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          if (idEditando === id) cancelarEdicion();
          cargarClientes();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al eliminar', esError: true }));
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setTelefono('');
    setCuit('');
    setDireccion('');
    setTipo('persona');
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    limpiarFormulario();
  };

  return (
    <div className="clientes-modulo-container">
      {/* FORMULARIO */}
      <div className="clientes-card">
        <h3>{idEditando ? '✏️ Editar Cliente' : '🤝 Registrar Cliente'}</h3>
        <form onSubmit={guardarCliente}>
          <div className="input-field-group">
            <label>Nombre / Razón Social</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Juan Pérez o SIGMA SA" />
          </div>
          <div className="input-field-group">
            <label>CUIT</label>
            <input type="text" value={cuit} onChange={e => setCuit(e.target.value)} required placeholder="Ej: 30-77888999-4" />
          </div>
          <div className="input-field-group">
            <label>Teléfono</label>
            <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 11223344" />
          </div>
          <div className="input-field-group">
            <label>Dirección</label>
            <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. Siempreviva 742" />
          </div>
          <div className="input-field-group">
            <label>Tipo de Cliente</label>
            <select value={tipo} onChange={e => setTipo(e.target.value as 'persona' | 'empresa')}>
              <option value="persona">Persona Física</option>
              <option value="empresa">Empresa / Jurídica</option>
            </select>
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar">
            {idEditando ? 'Actualizar Cliente' : 'Guardar Cliente'}
          </button>
          
          {idEditando && (
            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          )}
        </form>
      </div>

      {/* TABLA */}
      <div className="clientes-card">
        <h3>📋 Cartera de Clientes</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CUIT</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th className="acciones-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.cuit}</td>
                <td>{c.telefono || '-'}</td>
                <td>
                  <span className={`badge-tipo ${c.tipo === 'persona' ? 'badge-persona' : 'badge-empresa'}`}>
                    {c.tipo}
                  </span>
                </td>
                <td className="acciones-cell">
                  <button onClick={() => activarEdicion(c)} className="btn-editar-tabla">Editar</button>
                  <button onClick={() => eliminarCliente(c.id, c.nombre)} className="btn-eliminar-tabla">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
