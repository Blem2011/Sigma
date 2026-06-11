import { useState, useEffect } from 'react';
import axios from 'axios';
import './Consumos.css';

interface Obra { id: number; nombre: string; }
interface Material { id: number; nombre: string; unidad_medida: string; }
interface HistorialConsumo {
  id: number;
  obra: string;
  material: string;
  cantidad: number;
  unidad_medida: string;
  fecha_consumo: string;
}

export default function Consumos() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [consumos, setConsumos] = useState<HistorialConsumo[]>([]);

  // Estados del Formulario
  const [idObra, setIdObra] = useState('');
  const [idMaterial, setIdMaterial] = useState('');
  const [cantidad, setCantidad] = useState('');

  const [mensaje, setMensaje] = useState({ texto: '', esError: false });

  const cargarDatos = async () => {
    try {
      const [resObras, resMat, resCons] = await Promise.all([
        axios.get<Obra[]>('http://localhost:5000/api/obras'),
        axios.get<Material[]>('http://localhost:5000/api/materiales'),
        axios.get<HistorialConsumo[]>('http://localhost:5000/api/consumos')
      ]);
      setObras(resObras.data);
      setMateriales(resMat.data);
      setConsumos(resCons.data);
    } catch (err) {
      console.error('Error al sincronizar datos en módulo consumos:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrarSalida = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    axios.post('http://localhost:5000/api/consumos', {
      id_obra: Number(idObra),
      id_material: Number(idMaterial),
      cantidad: Number(cantidad)
    })
    .then(res => {
      setMensaje({ texto: res.data.mensaje, esError: false });
      setIdObra('');
      setIdMaterial('');
      setCantidad('');
      cargarDatos(); // Recarga listas e historial
    })
    .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al procesar la salida', esError: true }));
  };

  return (
    <div className="consumos-modulo-container">
      {/* FORMULARIO */}
      <div className="consumos-card">
        <h3>📋 Despacho / Salida a Obra</h3>
        <form onSubmit={registrarSalida} style={{ marginTop: '15px' }}>
          <div className="input-field-group">
            <label>Destino (Obra / Proyecto)</label>
            <select value={idObra} onChange={e => setIdObra(e.target.value)} required>
              <option value="">-- Elija la Obra Destino --</option>
              {obras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>

          <div className="input-field-group">
            <label>Material a Retirar</label>
            <select value={idMaterial} onChange={e => setIdMaterial(e.target.value)} required>
              <option value="">-- Elija el Insumo --</option>
              {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.unidad_medida})</option>)}
            </select>
          </div>

          <div className="input-field-group">
            <label>Cantidad a Enviar</label>
            <input type="number" step="0.01" value={cantidad} onChange={e => setCantidad(e.target.value)} required placeholder="0.00" />
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar" style={{ backgroundColor: '#ea580c' }}>
            Registrar Salida y Descontar Stock
          </button>
        </form>
      </div>

      {/* TABLA HISTORIAL */}
      <div className="consumos-card">
        <h3>📋 Historial de Insumos Despachados</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proyecto / Obra</th>
              <th>Material</th>
              <th>Cantidad Despachada</th>
            </tr>
          </thead>
          <tbody>
            {consumos.map(c => (
              <tr key={c.id}>
                <td>{new Date(c.fecha_consumo).toLocaleDateString('es-AR')}</td>
                <td><strong>{c.obra}</strong></td>
                <td>{c.material}</td>
                <td style={{ color: '#c2410c' }}><strong>- {Number(c.cantidad)} {c.unidad_medida}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
