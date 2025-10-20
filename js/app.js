// Aplicación de FastFood Express
class FastFoodApp {
  constructor() {
    this.carrito = []
    this.productos = []
    this.init()
  }

  async init() {
    await this.cargarProductos()
    this.setupEventListeners()
    this.actualizarCarrito()
  }

  // Cargar productos desde el backend
  async cargarProductos() {
    try {
      const response = await fetch("php/productos.php")
      this.productos = await response.json()
      this.renderizarProductos()
    } catch (error) {
      console.error("Error al cargar productos:", error)
      document.getElementById("productos-grid").innerHTML = '<p class="loading">Error al cargar productos</p>'
    }
  }

  // Renderizar productos en el DOM
  renderizarProductos() {
    const grid = document.getElementById("productos-grid")

    if (this.productos.length === 0) {
      grid.innerHTML = '<p class="loading">Cargando productos...</p>'
      return
    }

    grid.innerHTML = this.productos
      .map(
        (producto) => `
            <div class="producto-card">
                <div class="producto-imagen">
                    ${this.renderizarImagenProducto(producto)}
                </div>
                <div class="producto-info">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <p class="producto-descripcion">${producto.descripcion}</p>
                    <span class="producto-categoria">${producto.categoria}</span>
                    <div class="producto-precio">$${Number.parseInt(producto.precio).toLocaleString("es-CL")} CLP</div>
                    <button class="btn btn-primary btn-agregar" 
                            onclick="app.agregarAlCarrito(${producto.id_producto})">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `,
      )
      .join("")
  }

  renderizarImagenProducto(producto) {
    if (producto.imagen) {
      return `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img" 
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

  // Agregar producto al carrito
  agregarAlCarrito(idProducto) {
    const producto = this.productos.find((p) => p.id_producto == idProducto)
    if (!producto) return

    const itemExistente = this.carrito.find((item) => item.id === idProducto)

    if (itemExistente) {
      itemExistente.cantidad++
    } else {
      this.carrito.push({
        id: idProducto,
        nombre: producto.nombre,
        precio: Number.parseFloat(producto.precio),
        cantidad: 1,
      })
    }

    this.actualizarCarrito()
    this.mostrarNotificacion(`${producto.nombre} agregado al carrito`)
  }

  // Actualizar visualización del carrito
  actualizarCarrito() {
    const carritoItems = document.getElementById("carrito-items")
    const carritoCount = document.getElementById("carrito-count")
    const carritoTotal = document.getElementById("carrito-total")
    const btnCheckout = document.getElementById("btn-checkout")

    // Actualizar contador
    const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0)
    carritoCount.textContent = totalItems

    // Actualizar total
    const total = this.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    carritoTotal.textContent = `$${Math.round(total).toLocaleString("es-CL")} CLP`

    // Renderizar items del carrito
    if (this.carrito.length === 0) {
      carritoItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>'
      btnCheckout.style.display = "none"
    } else {
      carritoItems.innerHTML = this.carrito
        .map(
          (item) => `
                <div class="carrito-item">
                    <div>
                        <strong>${item.nombre}</strong><br>
                        $${Math.round(item.precio).toLocaleString("es-CL")} CLP x ${item.cantidad}
                    </div>
                    <div>
                        <button onclick="app.cambiarCantidad(${item.id}, -1)" class="btn btn-secondary">-</button>
                        <span style="margin: 0 10px;">${item.cantidad}</span>
                        <button onclick="app.cambiarCantidad(${item.id}, 1)" class="btn btn-secondary">+</button>
                        <button onclick="app.eliminarDelCarrito(${item.id})" class="btn btn-secondary" style="margin-left: 10px;">🗑️</button>
                    </div>
                </div>
            `,
        )
        .join("")
      btnCheckout.style.display = "block"
    }
  }

  // Cambiar cantidad de producto en carrito
  cambiarCantidad(idProducto, cambio) {
    const item = this.carrito.find((item) => item.id === idProducto)
    if (!item) return

    item.cantidad += cambio

    if (item.cantidad <= 0) {
      this.eliminarDelCarrito(idProducto)
    } else {
      this.actualizarCarrito()
    }
  }

  // Eliminar producto del carrito
  eliminarDelCarrito(idProducto) {
    this.carrito = this.carrito.filter((item) => item.id !== idProducto)
    this.actualizarCarrito()
  }

  // Configurar event listeners
  setupEventListeners() {
    // Botón de checkout
    document.getElementById("btn-checkout").addEventListener("click", () => {
      this.mostrarFormularioCheckout()
    })

    // Botón cancelar checkout
    document.getElementById("btn-cancelar").addEventListener("click", () => {
      this.ocultarFormularioCheckout()
    })

    // Formulario de checkout
    document.getElementById("form-checkout").addEventListener("submit", (e) => {
      e.preventDefault()
      this.procesarPedido()
    })

    // Validación en tiempo real
    this.setupValidacionTiempoReal()
  }

  // Mostrar formulario de checkout
  mostrarFormularioCheckout() {
    document.getElementById("checkout").style.display = "block"
    document.getElementById("checkout").scrollIntoView({ behavior: "smooth" })
  }

  // Ocultar formulario de checkout
  ocultarFormularioCheckout() {
    document.getElementById("checkout").style.display = "none"
    this.limpiarFormulario()
  }

  // Configurar validación en tiempo real
  setupValidacionTiempoReal() {
    const campos = ["nombre", "telefono", "email", "metodo-pago"]

    campos.forEach((campo) => {
      const input = document.getElementById(campo)

      // Validar mientras escribe (tiempo real)
      input.addEventListener("input", () => {
        // Solo validar si el campo tiene contenido o si ya se había validado antes
        if (input.value.trim() || input.classList.contains("error")) {
          this.validarCampo(campo)
        }
      })

      // Validar cuando sale del campo
      input.addEventListener("blur", () => this.validarCampo(campo))
    })
  }

  // Validar campo individual
  validarCampo(campo) {
    const input = document.getElementById(campo)
    const valor = input.value.trim()
    const errorElement = document.getElementById(`error-${campo}`)
    let error = ""

    switch (campo) {
      case "nombre":
        const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
        if (!valor) {
          error = "El nombre es obligatorio"
        } else if (valor.length < 2) {
          error = "El nombre debe tener al menos 2 caracteres"
        } else if (!nombreRegex.test(valor)) {
          error = "El nombre solo puede contener letras y espacios"
        }
        break

      case "telefono":
        const telefonoRegex = /^(\+569|9)[0-9]{8}$/
        if (!valor) {
          error = "El teléfono es obligatorio"
        } else if (!telefonoRegex.test(valor)) {
          error = "Formato válido: +569xxxxxxxx o 9xxxxxxxx"
        }
        break

      case "email":
        if (valor) {
          const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(cl|com|org|net|edu|gov|mil|int|info|biz|name|museum|coop|aero|[a-z]{2,4})$/i
          if (!emailRegex.test(valor)) {
            error = "Formato de email inválido (ej: usuario@mail.cl)"
          }
        }
        break

      case "metodo-pago":
        if (!valor) {
          error = "Debe seleccionar un método de pago"
        }
        break
    }

    errorElement.textContent = error
    input.classList.toggle("error", !!error)
    return !error
  }

  // Limpiar error de campo
  limpiarError(campo) {
    const errorElement = document.getElementById(`error-${campo}`)
    const input = document.getElementById(campo)
    errorElement.textContent = ""
    input.classList.remove("error")
  }

  // Validar formulario completo
  validarFormulario() {
    const campos = ["nombre", "telefono", "metodo-pago"]
    let esValido = true

    campos.forEach((campo) => {
      if (!this.validarCampo(campo)) {
        esValido = false
      }
    })

    // Validar email si se proporciona
    const email = document.getElementById("email").value.trim()
    if (email && !this.validarCampo("email")) {
      esValido = false
    }

    return esValido
  }

  // Procesar pedido
  async procesarPedido() {
    if (!this.validarFormulario()) {
      this.mostrarNotificacion("Por favor, corrija los errores en el formulario", "error")
      return
    }

    if (this.carrito.length === 0) {
      this.mostrarNotificacion("El carrito está vacío", "error")
      return
    }

    const formData = new FormData(document.getElementById("form-checkout"))
    const total = this.carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

    const datosVenta = {
      cliente: {
        nombre: formData.get("nombre"),
        telefono: formData.get("telefono"),
        email: formData.get("email") || null,
        direccion: formData.get("direccion") || null,
      },
      productos: this.carrito.map((item) => ({
        id: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
      total: total,
      metodo_pago: formData.get("metodo_pago"),
    }

    try {
      const response = await fetch("php/ventas.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosVenta),
      })

      const resultado = await response.json()

      if (resultado.success) {
        this.mostrarNotificacion("¡Pedido realizado con éxito!", "success")
        this.carrito = []
        this.actualizarCarrito()
        this.ocultarFormularioCheckout()
      } else {
        this.mostrarNotificacion("Error al procesar el pedido: " + resultado.error, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      this.mostrarNotificacion("Error de conexión", "error")
    }
  }

  // Limpiar formulario
  limpiarFormulario() {
    document.getElementById("form-checkout").reset()
    const errores = document.querySelectorAll(".error-message")
    errores.forEach((error) => (error.textContent = ""))
    const inputs = document.querySelectorAll(".error")
    inputs.forEach((input) => input.classList.remove("error"))
  }

  // Mostrar notificación
  mostrarNotificacion(mensaje, tipo = "info") {
    // Crear elemento de notificación
    const notificacion = document.createElement("div")
    notificacion.className = `notificacion notificacion-${tipo}`
    notificacion.textContent = mensaje

    // Estilos inline para la notificación
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

    // Remover después de 3 segundos
    setTimeout(() => {
      notificacion.remove()
    }, 3000)
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.app = new FastFoodApp()
})
