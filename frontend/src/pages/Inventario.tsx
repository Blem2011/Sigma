import { useState } from "react";

type Material = {
  nombre: string;
  stock: string;
  precio: string;
  unidad: string;
};

type Movimiento = {
  tipo: string;
  material: string;
  cantidad: string;
  fecha: string;
};

type InventarioProps = {
  materiales: Material[];
};

function Inventario({
  materiales
}: InventarioProps) {

  const [tipo, setTipo] = useState("Entrada");
  const [material, setMaterial] = useState("");
  const [cantidad, setCantidad] = useState("");

  const [movimientos, setMovimientos] =
    useState<Movimiento[]>([]);

  const registrarMovimiento = () => {

    if (
      material.trim() === "" ||
      cantidad.trim() === ""
    ) {
      alert("Complete todos los campos");
      return;
    }

    const fecha = new Date().toLocaleDateString();

    const nuevoMovimiento = {
      tipo,
      material,
      cantidad,
      fecha
    };

    setMovimientos([
      ...movimientos,
      nuevoMovimiento
    ]);

    setTipo("Entrada");
    setMaterial("");
    setCantidad("");
  };

  const eliminarMovimiento = (
    index: number
  ) => {

    const nuevaLista =
      movimientos.filter(
        (_, i) => i !== index
      );

    setMovimientos(nuevaLista);
  };

  return (
    <div>

      <h2>Inventario</h2>

      <select
        value={tipo}
        onChange={(e) =>
          setTipo(e.target.value)
        }
      >
        <option>Entrada</option>
        <option>Salida</option>
      </select>

      <br /><br />

      <select
        value={material}
        onChange={(e) =>
          setMaterial(e.target.value)
        }
      >
        <option value="">
          Seleccione material
        </option>

        {materiales.map((m, index) => (
          <option
            key={index}
            value={m.nombre}
          >
            {m.nombre}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) =>
          setCantidad(e.target.value)
        }
      />

      <br /><br />

      <button
        onClick={registrarMovimiento}
      >
        Registrar Movimiento
      </button>

      <hr />

      <h3>Movimientos</h3>

      {movimientos.length === 0 && (
        <p>
          No hay movimientos registrados.
        </p>
      )}

      {movimientos.map(
        (movimiento, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px"
            }}
          >
            <p>
              <strong>Tipo:</strong>{" "}
              {movimiento.tipo}
            </p>

            <p>
              <strong>Material:</strong>{" "}
              {movimiento.material}
            </p>

            <p>
              <strong>Cantidad:</strong>{" "}
              {movimiento.cantidad}
            </p>

            <p>
              <strong>Fecha:</strong>{" "}
              {movimiento.fecha}
            </p>

            <button
              onClick={() =>
                eliminarMovimiento(index)
              }
            >
              Eliminar
            </button>
          </div>
        )
      )}

    </div>
  );
}

export default Inventario;