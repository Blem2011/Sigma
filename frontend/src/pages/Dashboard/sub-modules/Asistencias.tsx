import { useState, useEffect } from 'react';
import axios from 'axios';
import './Asistencias.css';

interface Empleado { id: number; nombre_completo: string; especialidad: string; }
interface Asistencia {
  id: number;
  id_empleado: number;
  empleado_nombre: string;
  especialidad: string;
  fecha: string;
  estado: 'A tiempo' | 'Tardanza' | 'Falta Justificada' | 'Falta Médica' | 'Ausente';
  hora_entrada: string | null;
  hora_salida: string | null;
  observaciones: string | null;
}

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  // Estados del Formulario (Ponemos la fecha de hoy por defecto)
  const [idEmpleado, setIdEmpleado] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [estado, setEstado] = useState<'A tiempo' | 'Tardanza' | 'Falta Justificada' | 'Falta Médica' | 'Ausente'>('A tiempo');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [mensaje, setMensaje] = useState({ texto: '', esError: false });

  const cargarDatos = async () => {
    try {
      const [resAsis, resEmp] = await Promise.all([
        axios.get<Asistencia[]>('http://localhost:5000/api/asistencias'),
        axios.get<Empleado[]>('http://localhost:5000/api/empleados')
      ]);
      setAsistencias(resAsis.data);
      setEmpleados(resEmp.data);
    } catch (err) {
      console.error('Error al sincronizar datos en módulo asistencias:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarAsistencia = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    // Si el estado es una falta, ignoramos los horarios ingresados
    const esFalta = estado.includes('Falta') || estado === 'Ausente';

    axios.post('http://localhost:5000/api/asistencias', {
      id_empleado: Number(idEmpleado),
      fecha,
      estado,
      hora_entrada: esFalta ? '' : horaEntrada,
      hora_salida: esFalta ? '' : horaSalida,
      observaciones
    })
    .then(res => {
      setMensaje({ texto: res.data.mensaje, esError: false });
      setIdEmpleado('');
      setHoraEntrada('');
      setHoraSalida('');
      setObservaciones('');
      cargarDatos();
    })
    .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al guardar', esError: true }));
  };

  const obtenerEstiloBadge = (est: string) => {
    if (est === 'A tiempo') return 'status-atiempo';
    if (est === 'Tardanza') return 'status-tardanza';
    if (est === 'Falta Médica') return 'status-medica';
    if (est === 'Falta Justificada') return 'status-justificada';
    return 'status-ausente';
  };

  return (
    <div className="asistencias-modulo-container">
      {/* FORMULARIO */}
      <div className="asistencias-card">
        <h3>⏱️ Parte de Asistencia Diario</h3>
        <form onSubmit={guardarAsistencia} style={{ marginTop: '15px' }}>
          <div className="input-field-group">
            <label>Fecha de Registro</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
          </div>

          <div className="input-field-group">
            <label>Seleccionar Operario / Empleado</label>
            <select value={idEmpleado} onChange={e => setIdEmpleado(e.target.value)} required>
              <option value="">-- Seleccione el Trabajador --</option>
              {empleados.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre_completo} ({emp.especialidad})</option>)}
            </select>
          </div>

          <div className="input-field-group">
            <label>Condición / Estado</label>
            <select value={estado} onChange={e => setEstado(e.target.value as any)}>
              <option value="A tiempo">✓ A tiempo</option>
              <option value="Tardanza">⚠️ Tardanza</option>
              <option value="Falta Médica">🩺 Falta Médica</option>
              <option value="Falta Justificada">📄 Falta Justificada</option>
              <option value="Ausente">❌ Ausente (Sin Aviso)</option>
            </select>
          </div>

          {/* Renderizado condicional: Ocultamos horas si el operario faltó */}
          {!estado.includes('Falta') && estado !== 'Ausente' && (
            <>
              <div className="input-field-group">
                <label>Hora de Entrada</label>
                <input type="time" value={horaEntrada} onChange={e => setHoraEntrada(e.target.value)} required />
              </div>
              <div className="input-field-group">
                <label>Hora de Salida</label>
                <input type="time" value={horaSalida} onChange={e => setHoraSalida(e.target.value)} required />
              </div>
            </>
          )}

          <div className="input-field-group">
            <label>Novedades / Observaciones</label>
            <input type="text" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Ej: Certificado médico adjunto o motivo" />
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar" style={{ backgroundColor: '#0f172a' }}>
            Fichar Presentismo
          </button>
        </form>
      </div>

      {/* TABLA HISTORIAL */}
      <div className="asistencias-card">
        <h3>📋 Planilla de Control Horario e Incidencias</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Empleado</th>
              <th>Estado</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map(a => (
              <tr key={a.id}>
                <td>{new Date(a.fecha).toLocaleDateString('es-AR')}</td>
                <td><strong>{a.empleado_nombre}</strong> <br /><span style={{ fontSize: '11px', color: '#64748b' }}>{a.especialidad}</span></td>
                <td>
                  <span className={`badge-asistencia ${obtenerEstiloBadge(a.estado)}`}>
                    {a.estado}
                  </span>
                </td>
                <td>{a.hora_entrada ? a.hora_entrada.substring(0, 5) : '-'}</td>
                <td>{a.hora_salida ? a.hora_salida.substring(0, 5) : '-'}</td>
                <td style={{ fontSize: '13px', color: '#475569' }}>{a.observaciones || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
