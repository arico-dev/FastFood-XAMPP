// Historial de ventas y productos
class HistorialApp {
  constructor() {
    this.init()
  }

  async init() {
    await this.cargarVentas()
    await this.cargarProductos()
  }

  // Cargar historial de ventas
  async cargarVentas() {
    try {
      const response = await fetch("php/ventas.php")
      const ventas = await response.json()
      this.renderizarVentas(ventas)
    } catch (error) {
      console.error("Error al cargar ventas:", error)
      document.getElementById("ventas-tabla").innerHTML = '<p class="loading">Error al cargar ventas</p>'
    }
  }

  // Cargar productos registrados
  async cargarProductos() {
    try {
      const response = await fetch("php/productos.php")
      const productos = await response.json()
      this.renderizarProductos(productos)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      document.getElementById("productos-tabla").innerHTML = '<p class="loading">Error al cargar productos</p>'
    }
  }

  // Renderizar tabla de ventas
  renderizarVentas(ventas) {
    const container = document.getElementById("ventas-tabla")

    if (ventas.length === 0) {
      container.innerHTML = '<p class="loading">No hay ventas registradas</p>'
      return
    }

    const tabla = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID Venta</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Total</th>
                        <th>Método de Pago</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${ventas
                      .map(
                        (venta) => `
                        <tr>
                            <td>#${venta.id_venta}</td>
                            <td>${venta.cliente_nombre}</td>
                            <td>${venta.telefono}</td>
                            <td>$${Math.round(Number.parseFloat(venta.total)).toLocaleString("es-CL")} CLP</td>
                            <td>${this.formatearMetodoPago(venta.metodo_pago)}</td>
                            <td>${this.formatearEstado(venta.estado)}</td>
                            <td>${this.formatearFecha(venta.fecha_venta)}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        `

    container.innerHTML = tabla
  }

  // Renderizar tabla de productos
  renderizarProductos(productos) {
    const container = document.getElementById("productos-tabla")

    if (productos.length === 0) {
      container.innerHTML = '<p class="loading">No hay productos registrados</p>'
      return
    }

    const tabla = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Categoría</th>
                        <th>Disponible</th>
                        <th>Fecha Creación</th>
                    </tr>
                </thead>
                <tbody>
                    ${productos
                      .map(
                        (producto) => `
                        <tr>
                            <td>#${producto.id_producto}</td>
                            <td>${producto.nombre}</td>
                            <td>${producto.descripcion}</td>
                            <td>$${Math.round(Number.parseFloat(producto.precio)).toLocaleString("es-CL")} CLP</td>
                            <td>${this.formatearCategoria(producto.categoria)}</td>
                            <td>${producto.disponible ? "✅ Sí" : "❌ No"}</td>
                            <td>${this.formatearFecha(producto.fecha_creacion)}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        `

    container.innerHTML = tabla
  }

  // Formatear método de pago
  formatearMetodoPago(metodo) {
    const metodos = {
      efectivo: "💵 Efectivo",
      tarjeta: "💳 Tarjeta",
      transferencia: "🏦 Transferencia",
    }
    return metodos[metodo] || metodo
  }

  // Formatear estado
  formatearEstado(estado) {
    const estados = {
      pendiente: "⏳ Pendiente",
      preparando: "👨‍🍳 Preparando",
      listo: "✅ Listo",
      entregado: "📦 Entregado",
    }
    return estados[estado] || estado
  }

  // Formatear categoría
  formatearCategoria(categoria) {
    const categorias = {
      hamburguesa: "🍔 Hamburguesa",
      papas: "🍟 Papas",
      bebida: "🥤 Bebida",
      postre: "🍦 Postre",
    }
    return categorias[categoria] || categoria
  }

  // Formatear fecha
  formatearFecha(fecha) {
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new HistorialApp()
})
