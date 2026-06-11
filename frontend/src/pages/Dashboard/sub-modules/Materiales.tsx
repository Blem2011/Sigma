import { useState, useEffect } from 'react';
import axios from 'axios';
import './Materiales.css';

interface Material {
  id: number;
  nombre: string;
  cantidad: number;
  unidad_medida: string;
  stock_minimo: number;
}

export default function Materiales() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  
  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('Bolsas');
  const [stockMinimo, setStockMinimo] = useState('');
  
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const cargarMateriales = () => {
    axios.get<Material[]>('https://sigma-production-e9dc.up.railway.app/api/materiales')
      .then(res => setMateriales(res.data))
      .catch(err => console.error('Error al cargar inventario:', err));
  };

  useEffect(() => {
    cargarMateriales();
  }, []);

  const guardarMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    const datosMaterial = { 
      nombre, 
      cantidad: Number(cantidad), 
      unidad_medida: unidadMedida, 
      stock_minimo: Number(stockMinimo) 
    };

    if (idEditando) {
      axios.put(`https://sigma-production-e9dc.up.railway.app/api/materiales/${idEditando}`, datosMaterial)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          cancelarEdicion();
          cargarMateriales();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al actualizar', esError: true }));
    } else {
      axios.post('https://sigma-production-e9dc.up.railway.app/api/materiales', datosMaterial)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          limpiarFormulario();
          cargarMateriales();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al guardar', esError: true }));
    }
  };

  const activarEdicion = (m: Material) => {
    setIdEditando(m.id);
    setNombre(m.nombre);
    setCantidad(m.cantidad.toString());
    setUnidadMedida(m.unidad_medida);
    setStockMinimo(m.stock_minimo.toString());
    setMensaje({ texto: '', esError: false });
  };

  const eliminarMaterial = (id: number, nombreMat: string) => {
    if (window.confirm(`¿Seguro que querés eliminar el material: ${nombreMat}?`)) {
      axios.delete(`https://sigma-production-e9dc.up.railway.app/api/materiales/${id}`)
        .then(res => {
          setMensaje({ texto: res.data.mensaje, esError: false });
          if (idEditando === id) cancelarEdicion();
          cargarMateriales();
        })
        .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al eliminar', esError: true }));
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setCantidad('');
    setUnidadMedida('Bolsas');
    setStockMinimo('');
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    limpiarFormulario();
  };

  return (
    <div className="materiales-modulo-container">
      {/* FORMULARIO */}
      <div className="materiales-card">
        <h3>{idEditando ? '✏️ Modificar Material' : '🏗️ Registrar Material / Insumo'}</h3>
        <form onSubmit={guardarMaterial}>
          <div className="input-field-group">
            <label>Nombre del Material</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Cemento Loma Negra" />
          </div>
          <div className="input-field-group">
            <label>Cantidad en Stock</label>
            <input type="number" step="0.01" value={cantidad} onChange={e => setCantidad(e.target.value)} required placeholder="Ej: 50" />
          </div>
          <div className="input-field-group">
            <label>Unidad de Medida</label>
            <select value={unidadMedida} onChange={e => setUnidadMedida(e.target.value)}>
              <option value="Bolsas">Bolsas</option>
              <option value="m3">Metros Cúbicos (m³)</option>
              <option value="Unidades">Unidades</option>
              <option value="Kg">Kilogramos (Kg)</option>
              <option value="Litros">Litros</option>
            </select>
          </div>
          <div className="input-field-group">
            <label>Stock Mínimo de Alerta</label>
            <input type="number" step="0.01" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} required placeholder="Ej: 10" />
          </div>

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar">
            {idEditando ? 'Actualizar Material' : 'Guardar Material'}
          </button>
          
          {idEditando && (
            <button type="button" onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          )}
        </form>
      </div>

      {/* TABLA */}
      <div className="materiales-card">
        <h3>📦 Inventario Actual de Depósito</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Material</th>
              <th>Disponible</th>
              <th>Unidad</th>
              <th>Estado Alerta</th>
              <th className="acciones-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map(m => {
              const esBajo = m.cantidad <= m.stock_minimo;
              return (
                <tr key={m.id} className={esBajo ? 'alerta-stock-bajo' : ''}>
                  <td>{m.nombre}</td>
                  <td><strong>{Number(m.cantidad)}</strong></td>
                  <td>{m.unidad_medida}</td>
                  <td>
                    <span className={`badge-stock ${esBajo ? 'badge-critico' : 'badge-ok'}`}>
                      {esBajo ? '⚠️ RECOMPRAR' : '✓ OK'}
                    </span>
                  </td>
                  <td className="acciones-cell">
                    <button onClick={() => activarEdicion(m)} className="btn-editar-tabla">Editar</button>
                    <button onClick={() => eliminarMaterial(m.id, m.nombre)} className="btn-eliminar-tabla">Borrar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
