import { useState, useEffect } from 'react';
import axios from 'axios';
import './Empleados.css';

interface Obra { id: number; nombre: string; }
interface Empleado {
  id: number;
  id_obra: number | null;
  obra_nombre: string | null;
  nombre_completo: string;
  dni: string;
  telefono: string;
  especialidad: string;
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);

  // Estados del Formulario
  const [idObra, setIdObra] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [especialidad, setEspecialidad] = useState('Albañil Oficial');

  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const cargarDatos = async () => {
    try {
      const [resEmp, resObras] = await Promise.all([
        axios.get<Empleado[]>('https://sigma-production-e9dc.up.railway.app/api/empleados'),
        axios.get<Obra[]>('https://sigma-production-e9dc.up.railway.app/api/obras')
      ]);
      setEmpleados(resEmp.data);
      setObras(resObras.data);
    } catch (err) {
      console.error('Error al sincronizar listas en módulo empleados:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    const datosEmpleado = {
      id_obra: idObra === '' ? null : Number(idObra),
      nombre_completo: nombreCompleto,
      dni,
      telefono,
      especialidad
    };

    if (idEditando) {
      axios.put(`https://sigma-production-e9dc.up.railway.app/api/empleados/${idEditando}`, datosEmpleado)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          cancelarEdicion();
          cargarDatos();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al actualizar', esError: true }));
    } else {
      axios.post('https://sigma-production-e9dc.up.railway.app/api/empleados', datosEmpleado)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          limpiarFormulario();
          cargarDatos();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al guardar', esError: true }));
    }
  };

  const activarEdicion = (e: Empleado) => {
    setIdEditando(e.id);
    setIdObra(e.id_obra ? e.id_obra.toString() : '');
    setNombreCompleto(e.nombre_completo);
    setDni(e.dni);
    setTelefono(e.telefono || '');
    setEspecialidad(e.especialidad);
    setMensaje({ texto: '', esError: false });
  };

  const eliminarEmpleado = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que querés dar de baja a ${nombre}?`)) {
      axios.delete(`https://sigma-production-e9dc.up.railway.app/api/empleados/${id}`)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          if (idEditando === id) cancelarEdicion();
          cargarDatos();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al eliminar', esError: true }));
    }
  };

  const limpiarFormulario = () => {
    setIdObra('');
    setNombreCompleto('');
    setDni('');
    setTelefono('');
    setEspecialidad('Albañil Oficial');
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    limpiarFormulario();
  };

  return (
    <div className="empleados-modulo-container">
      {/* FORMULARIO */}
      <div className="empleados-card">
        <h3>{idEditando ? '✏️ Editar Ficha de Empleado' : '👥 Registrar Empleado / Obrero'}</h3>
        <form onSubmit={guardarEmpleado}>
          <div className="input-field-group">
            <label>Nombre Completo</label>
            <input type="text" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required placeholder="Ej: Pedro Gómez" />
          </div>
          <div className="input-field-group">
            <label>DNI</label>
            <input type="text" value={dni} onChange={e => setDni(e.target.value)} required placeholder="Ej: 30.123.456" />
          </div>
          <div className="input-field-group">
            <label>Teléfono de Contacto</label>
            <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Nro de celular" />
          </div>
          <div className="input-field-group">
            <label>Especialidad del Rubro</label>
            <select value={especialidad} onChange={e => setEspecialidad(e.target.value)}>
              <option value="Albañil Oficial">Albañil Oficial</option>
              <option value="Ayudante de Albañil">Ayudante de Albañil</option>
              <option value="Capataz de Obra">Capataz de Obra</option>
              <option value="Electricista">Electricista</option>
              <option value="Plomero / Gasista">Plomero / Gasista</option>
              <option value="Maquinista Pesado">Maquinista Pesado</option>
              <option value="Arquitecto / Ingeniero">Arquitecto / Ingeniero</option>
            </select>
          </div>
          <div className="input-field-group">
            <label>Asignar Destino (Obra)</label>
            <select value={idObra} onChange={e => setIdObra(e.target.value)}>
              <option value="">-- Disponible / Sin Obra Fija --</option>
              {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar" style={{ backgroundColor: '#0284c7' }}>
            {idEditando ? 'Actualizar Ficha' : 'Dar de Alta Empleado'}
          </button>
          
          {idEditando && (
            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          )}
        </form>
      </div>

      {/* TABLA */}
      <div className="empleados-card">
        <h3>📋 Plantilla de Personal de SIGMA</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>DNI</th>
              <th>Especialidad</th>
              <th>Obra Asignada</th>
              <th className="acciones-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map(e => (
              <tr key={e.id}>
                <td><strong>{e.nombre_completo}</strong></td>
                <td>{e.dni}</td>
                <td>
                  <span className="badge-especialidad">{e.especialidad}</span>
                </td>
                <td>
                  {e.obra_nombre ? (
                    <span className="obra-asignada-text">🏗️ {e.obra_nombre}</span>
                  ) : (
                    <span className="obra-libre-text">✓ Disponible</span>
                  )}
                </td>
                <td className="acciones-cell">
                  <button onClick={() => activarEdicion(e)} className="btn-editar-tabla">Editar</button>
                  <button onClick={() => eliminarEmpleado(e.id, e.nombre_completo)} className="btn-eliminar-tabla">Baja</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
