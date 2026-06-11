type SidebarProps = {
  cambiarPagina: (pagina: string) => void;
  onLogout: () => void;
  paginaActual: string;
};

function Sidebar({
  cambiarPagina,
  onLogout,
  paginaActual
}: SidebarProps) {
  return (
    <div className="sidebar">
      <h2>SIGMA</h2>

      <hr />

      <p
        className={
          paginaActual === "dashboard"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("dashboard")
        }
      >
        Dashboard
      </p>

      <p
        className={
          paginaActual === "usuarios"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("usuarios")
        }
      >
        Usuarios
      </p>

      <p
        className={
          paginaActual === "clientes"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("clientes")
        }
      >
        Clientes
      </p>

      <p
        className={
          paginaActual === "materiales"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("materiales")
        }
      >
        Materiales
      </p>

      <p
        className={
          paginaActual === "inventario"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("inventario")
        }
      >
        Inventario
      </p>

      <p
        className={
          paginaActual === "proveedores"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("proveedores")
        }
      >
        Proveedores
      </p>

      <p
        className={
          paginaActual === "compras"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("compras")
        }
      >
        Compras
      </p>

      <p
        className={
          paginaActual === "obras"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("obras")
        }
      >
        Obras
      </p>

      <p
        className={
          paginaActual === "consumo"
            ? "activo"
            : ""
        }
        onClick={() =>
          cambiarPagina("consumo")
        }
      >
        Consumo Materiales
      </p>

      <hr />

      <p onClick={onLogout}>
        Cerrar sesión
      </p>
    </div>
  );
}

export default Sidebar;