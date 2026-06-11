import { useState, useEffect } from 'react';
import axios from 'axios';
import './Compras.css';

interface Proveedor { id: number; nombre: string; }
interface Material { id: number; nombre: string; unidad_medida: string; }
interface HistorialCompra {
  id: number;
  material: string;
  proveedor: string;
  cantidad: number;
  precio_unitario: number;
  unidad_medida: string;
  fecha_compra: string;
}

export default function Compras() {
  // Datos cargados para los Selects y la Tabla
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [compras, setCompras] = useState<HistorialCompra[]>([]);

  // Estados del Formulario
  const [idProveedor, setIdProveedor] = useState('');
  const [idMaterial, setIdMaterial] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');

  const [mensaje, setMensaje] = useState({ texto: '', esError: false });

  const cargarDatosIniciales = async () => {
    try {
      const [resProv, resMat, resComp] = await Promise.all([
        axios.get<Proveedor[]>('https://sigma-production-e9dc.up.railway.app/api/proveedores'),
        axios.get<Material[]>('https://sigma-production-e9dc.up.railway.app/api/materiales'),
        axios.get<HistorialCompra[]>('https://sigma-production-e9dc.up.railway.app/api/compras')
      ]);
      setProveedores(resProv.data);
      setMateriales(resMat.data);
      setCompras(resComp.data);
    } catch (err) {
      console.error('Error al sincronizar listas del módulo compras:', err);
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const ejecutarCompra = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', esError: false });

    axios.post('https://sigma-production-e9dc.up.railway.app/api/compras', {
      id_proveedor: Number(idProveedor),
      id_material: Number(idMaterial),
      cantidad: Number(cantidad),
      precio_unitario: Number(precioUnitario)
    })
    .then(res => {
      setMensaje({ texto: res.data.mensaje, esError: false });
      setIdProveedor('');
      setIdMaterial('');
      setCantidad('');
      setPrecioUnitario('');
      cargarDatosIniciales(); // Recarga la tabla de compras y actualiza almacén en segundo plano
    })
    .catch(err => setMensaje({ texto: err.response?.data?.error || 'Error al procesar la compra', esError: true }));
  };

  // Cálculo rápido del total estimado en el formulario
  const totalEstimado = Number(cantidad) * Number(precioUnitario);

  return (
    <div className="compras-modulo-container">
      {/* FORMULARIO */}
      <div className="compras-card">
        <h3>🛒 Registrar Orden de Compra</h3>
        <form onSubmit={ejecutarCompra} style={{ marginTop: '15px' }}>
          <div className="input-field-group">
            <label>Seleccionar Proveedor</label>
            <select value={idProveedor} onChange={e => setIdProveedor(e.target.value)} required>
              <option value="">-- Elija un Proveedor --</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="input-field-group">
            <label>Material / Insumo</label>
            <select value={idMaterial} onChange={e => setIdMaterial(e.target.value)} required>
              <option value="">-- Elija qué va a comprar --</option>
              {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.unidad_medida})</option>)}
            </select>
          </div>

          <div className="input-field-group">
            <label>Cantidad Adquirida</label>
            <input type="number" step="0.01" value={cantidad} onChange={e => setCantidad(e.target.value)} required placeholder="0.00" />
          </div>

          <div className="input-field-group">
            <label>Precio Unitario ($)</label>
            <input type="number" step="0.01" value={precioUnitario} onChange={e => setPrecioUnitario(e.target.value)} required placeholder="Coste por unidad" />
          </div>

          {totalEstimado > 0 && (
            <div className="total-compra-preview">
              Total de la Operación: ${totalEstimado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          )}

          {mensaje.texto && (
            <p className="status-message" style={{ color: mensaje.esError ? '#ef4444' : '#10b981' }}>{mensaje.texto}</p>
          )}

          <button type="submit" className="btn-registrar" style={{ backgroundColor: '#16a34a' }}>
            Ingresar Compra y Sumar Stock
          </button>
        </form>
      </div>

      {/* HISTORIAL */}
      <div className="compras-card">
        <h3>📋 Historial de Órdenes de Compra</h3>
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Material</th>
              <th>Proveedor</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {compras.map(c => (
              <tr key={c.id}>
                <td>{new Date(c.fecha_compra).toLocaleDateString('es-AR')}</td>
                <td>{c.material}</td>
                <td>{c.proveedor}</td>
                <td><strong>{Number(c.cantidad)} {c.unidad_medida}</strong></td>
                <td>${Number(c.precio_unitario).toLocaleString('es-AR')}</td>
                <td><strong>${(c.cantidad * c.precio_unitario).toLocaleString('es-AR')}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
