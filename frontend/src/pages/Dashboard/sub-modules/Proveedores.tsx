import { useState, useEffect } from 'react';
import axios from 'axios';
import './Proveedores.css';

interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  cuit: string;
  direccion: string;
  tipo: 'persona' | 'empresa';
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  
  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cuit, setCuit] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipo, setTipo] = useState<'persona' | 'empresa'>('empresa');
  
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const cargarProveedores = () => {
    axios.get<Proveedor[]>('https://sigma-production-e9dc.up.railway.app/api/proveedores')
      .then(res => setProveedores(res.data))
      .catch(err => console.error('Error al cargar lista de proveedores:', err));
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const guardarProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    const datosProveedor = { nombre, telefono, cuit, direccion, tipo };

    if (idEditando) {
      axios.put(`https://sigma-production-e9dc.up.railway.app/api/proveedores/${idEditando}`, datosProveedor)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          cancelarEdicion();
          cargarProveedores();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al actualizar', esError: true }));
    } else {
      axios.post('https://sigma-production-e9dc.up.railway.app/api/proveedores', datosProveedor)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          limpiarFormulario();
          cargarProveedores();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al guardar', esError: true }));
    }
  };

  const activarEdicion = (p: Proveedor) => {
    setIdEditando(p.id);
    setNombre(p.nombre);
    setTelefono(p.telefono);
    setCuit(p.cuit);
    setDireccion(p.direccion);
    setTipo(p.tipo);
    setMensaje({ texto: '', esError: false });
  };

  const eliminarProveedor = (id: number, nombreProv: string) => {
    if (window.confirm(`¿Estás seguro de que querés eliminar al proveedor: ${nombreProv}?`)) {
      axios.delete(`https://sigma-production-e9dc.up.railway.app/api/proveedores/${id}`)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          if (idEditando === id) cancelarEdicion();
          cargarProveedores();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al eliminar', esError: true }));
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setTelefono('');
    setCuit('');
    setDireccion('');
    setTipo('empresa');
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    limpiarFormulario();
  };

  return (
    <div className="proveedores-modulo-container">
      {/* FORMULARIO */}
      <div className="proveedores-card">
        <h3>{idEditando ? '✏️ Editar Proveedor' : '📦 Registrar Proveedor'}</h3>
        <form onSubmit={guardarProveedor}>
          <div className="input-field-group">
            <label>Nombre / Razón Social</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Corralón SRL" />
          </div>
          <div className="input-field-group">
            <label>CUIT</label>
            <input type="text" value={cuit} onChange={e => setCuit(e.target.value)} required placeholder="Ej: 30-11223344-5" />
          </div>
          <div className="input-field-group">
            <label>Teléfono</label>
            <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 11445566" />
          </div>
          <div className="input-field-group">
            <label>Dirección</label>
            <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. Colón 450" />
          </div>
          <div className="input-field-group">
            <label>Tipo de Proveedor</label>
            <select value={tipo} onChange={e => setTipo(e.target.value as 'persona' | 'empresa')}>
              <option value="empresa">Empresa / Jurídica</option>
              <option value="persona">Persona Física / Contratista</option>
            </select>
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar">
            {idEditando ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
          </button>
          
          {idEditando && (
            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          )}
        </form>
      </div>

      {/* TABLA */}
      <div className="proveedores-card">
        <h3>📋 Registro de Proveedores</h3>
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
            {proveedores.map(p => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.cuit}</td>
                <td>{p.telefono || '-'}</td>
                <td>
                  <span className={`badge-prov-tipo ${p.tipo === 'persona' ? 'badge-prov-persona' : 'badge-prov-empresa'}`}>
                    {p.tipo === 'persona' ? 'Persona' : 'Empresa'}
                  </span>
                </td>
                <td className="acciones-cell">
                  <button onClick={() => activarEdicion(p)} className="btn-editar-tabla">Editar</button>
                  <button onClick={() => eliminarProveedor(p.id, p.nombre)} className="btn-eliminar-tabla">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
