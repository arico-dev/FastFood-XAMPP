// Aplicación de administración de productos
class AdminApp {
  constructor() {
    this.productos = []
    this.productoEditando = null
    this.init()
  }

  async init() {
    await this.cargarProductos()
    this.setupEventListeners()
  }

  // Cargar productos desde el backend
  async cargarProductos() {
    try {
      const response = await fetch("php/admin-productos.php")
      this.productos = await response.json()
      this.renderizarProductosAdmin()
    } catch (error) {
      console.error("Error al cargar productos:", error)
      this.mostrarNotificacion("Error al cargar productos", "error")
    }
  }

  // Renderizar productos en el panel de administración
  renderizarProductosAdmin() {
    const container = document.getElementById("productos-admin-lista")

    if (this.productos.length === 0) {
      container.innerHTML = '<p class="loading">No hay productos registrados</p>'
      return
    }

    container.innerHTML = this.productos
      .map(
        (producto) => `
                <div class="producto-admin-card">
                    <div class="producto-admin-imagen">
                        ${this.renderizarImagenProducto(producto)}
                    </div>
                    <div class="producto-admin-info">
                        <h4>${producto.nombre}</h4>
                        <p class="descripcion">${producto.descripcion}</p>
                        <div class="producto-admin-detalles">
                            <span class="precio">$${Math.round(Number.parseFloat(producto.precio)).toLocaleString("es-CL")} CLP</span>
                            <span class="categoria">${this.formatearCategoria(producto.categoria)}</span>
                            <span class="disponible ${producto.disponible ? "activo" : "inactivo"}">
                                ${producto.disponible ? "✅ Disponible" : "❌ No disponible"}
                            </span>
                        </div>
                        <div class="producto-admin-acciones">
                            <button onclick="adminApp.editarProducto(${producto.id_producto})" class="btn btn-secondary btn-sm">
                                ✏️ Editar
                            </button>
                            <button onclick="adminApp.eliminarProducto(${producto.id_producto})" class="btn btn-danger btn-sm">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `,
      )
      .join("")
  }

  renderizarImagenProducto(producto) {
    if (producto.imagen) {
      return `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-admin-img" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="producto-emoji" style="display:none;">${this.getEmojiCategoria(producto.categoria)}</div>`
    } else {
      return `<div class="producto-emoji">${this.getEmojiCategoria(producto.categoria)}</div>`
    }
  }

  // Obtener emoji según categoría
  getEmojiCategoria(categoria) {
    const emojis = {
      hamburguesa: "🍔",
      papas: "🍟",
      bebida: "🥤",
      postre: "🍦",
    }
    return emojis[categoria] || "🍽️"
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

  // Configurar event listeners
  setupEventListeners() {
    // Botón nuevo producto
    document.getElementById("btn-nuevo-producto").addEventListener("click", () => {
      this.mostrarFormularioProducto()
    })

    // Botón cancelar
    document.getElementById("btn-cancelar-producto").addEventListener("click", () => {
      this.ocultarFormularioProducto()
    })

    // Formulario de producto
    document.getElementById("form-producto").addEventListener("submit", (e) => {
      e.preventDefault()
      this.guardarProducto()
    })

    // Validación en tiempo real
    this.setupValidacionTiempoReal()
  }

  // Mostrar formulario de producto
  mostrarFormularioProducto(producto = null) {
    const container = document.getElementById("form-producto-container")
    const titulo = document.getElementById("form-titulo")

    if (producto) {
      // Modo edición
      titulo.textContent = "Editar Producto"
      this.productoEditando = producto
      this.llenarFormulario(producto)
    } else {
      // Modo creación
      titulo.textContent = "Agregar Producto"
      this.productoEditando = null
      this.limpiarFormulario()
    }

    container.style.display = "block"
    container.scrollIntoView({ behavior: "smooth" })
  }

  // Ocultar formulario de producto
  ocultarFormularioProducto() {
    document.getElementById("form-producto-container").style.display = "none"
    this.limpiarFormulario()
    this.productoEditando = null
  }

  // Llenar formulario con datos del producto
  llenarFormulario(producto) {
    document.getElementById("producto-id").value = producto.id_producto
    document.getElementById("producto-nombre").value = producto.nombre
    document.getElementById("producto-descripcion").value = producto.descripcion
    document.getElementById("producto-precio").value = producto.precio
    document.getElementById("producto-categoria").value = producto.categoria
    document.getElementById("producto-imagen").value = producto.imagen || ""
    document.getElementById("producto-disponible").checked = producto.disponible
  }

  // Limpiar formulario
  limpiarFormulario() {
    document.getElementById("form-producto").reset()
    const errores = document.querySelectorAll(".error-message")
    errores.forEach((error) => (error.textContent = ""))
    const inputs = document.querySelectorAll(".error")
    inputs.forEach((input) => input.classList.remove("error"))
  }

  // Configurar validación en tiempo real
  setupValidacionTiempoReal() {
    const campos = ["producto-nombre", "producto-descripcion", "producto-precio", "producto-categoria"]

    campos.forEach((campo) => {
      const input = document.getElementById(campo)

      input.addEventListener("input", () => {
        if (input.value.trim() || input.classList.contains("error")) {
          this.validarCampo(campo)
        }
      })

      input.addEventListener("blur", () => this.validarCampo(campo))
    })
  }

  // Validar campo individual
  validarCampo(campo) {
    const input = document.getElementById(campo)
    const valor = input.value.trim()
    const errorElement = document.getElementById(`error-${campo.replace("producto-", "")}`)
    let error = ""

    switch (campo) {
      case "producto-nombre":
        if (!valor) {
          error = "El nombre es obligatorio"
        } else if (valor.length < 3) {
          error = "El nombre debe tener al menos 3 caracteres"
        }
        break

      case "producto-descripcion":
        if (!valor) {
          error = "La descripción es obligatoria"
        } else if (valor.length < 10) {
          error = "La descripción debe tener al menos 10 caracteres"
        }
        break

      case "producto-precio":
        const precio = Number.parseFloat(valor)
        if (!valor) {
          error = "El precio es obligatorio"
        } else if (isNaN(precio) || precio <= 0) {
          error = "El precio debe ser un número mayor a 0"
        }
        break

      case "producto-categoria":
        if (!valor) {
          error = "Debe seleccionar una categoría"
        }
        break
    }

    errorElement.textContent = error
    input.classList.toggle("error", !!error)
    return !error
  }

  // Validar formulario completo
  validarFormulario() {
    const campos = ["producto-nombre", "producto-descripcion", "producto-precio", "producto-categoria"]
    let esValido = true

    campos.forEach((campo) => {
      if (!this.validarCampo(campo)) {
        esValido = false
      }
    })

    return esValido
  }

  // Guardar producto (crear o actualizar)
  async guardarProducto() {
    if (!this.validarFormulario()) {
      this.mostrarNotificacion("Por favor, corrija los errores en el formulario", "error")
      return
    }

    const formData = new FormData(document.getElementById("form-producto"))
    const datosProducto = {
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      precio: Number.parseFloat(formData.get("precio")),
      categoria: formData.get("categoria"),
      imagen: formData.get("imagen") || null,
      disponible: formData.get("disponible") ? 1 : 0,
    }

    // Si estamos editando, agregar el ID
    if (this.productoEditando) {
      datosProducto.id_producto = this.productoEditando.id_producto
    }

    try {
      const method = this.productoEditando ? "PUT" : "POST"
      const response = await fetch("php/admin-productos.php", {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosProducto),
      })

      const resultado = await response.json()

      if (resultado.success) {
        const mensaje = this.productoEditando ? "Producto actualizado con éxito" : "Producto creado con éxito"
        this.mostrarNotificacion(mensaje, "success")
        await this.cargarProductos()
        this.ocultarFormularioProducto()
      } else {
        this.mostrarNotificacion("Error al guardar producto: " + resultado.error, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      this.mostrarNotificacion("Error de conexión", "error")
    }
  }

  // Editar producto
  editarProducto(idProducto) {
    const producto = this.productos.find((p) => p.id_producto == idProducto)
    if (producto) {
      this.mostrarFormularioProducto(producto)
    }
  }

  // Eliminar producto
  async eliminarProducto(idProducto) {
    const producto = this.productos.find((p) => p.id_producto == idProducto)
    if (!producto) return

    if (!confirm(`¿Está seguro de eliminar el producto "${producto.nombre}"?`)) {
      return
    }

    try {
      const response = await fetch("php/admin-productos.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_producto: idProducto }),
      })

      const resultado = await response.json()

      if (resultado.success) {
        this.mostrarNotificacion("Producto eliminado con éxito", "success")
        await this.cargarProductos()
      } else {
        this.mostrarNotificacion("Error al eliminar producto: " + resultado.error, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      this.mostrarNotificacion("Error de conexión", "error")
    }
  }

  // Mostrar notificación
  mostrarNotificacion(mensaje, tipo = "info") {
    const notificacion = document.createElement("div")
    notificacion.className = `notificacion notificacion-${tipo}`
    notificacion.textContent = mensaje

    Object.assign(notificacion.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "1rem 1.5rem",
      borderRadius: "5px",
      color: "white",
      fontWeight: "500",
      zIndex: "1000",
      maxWidth: "300px",
      backgroundColor: tipo === "error" ? "#dc3545" : tipo === "success" ? "#28a745" : "#17a2b8",
    })

    document.body.appendChild(notificacion)

    setTimeout(() => {
      notificacion.remove()
    }, 3000)
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.adminApp = new AdminApp()
})
