-- Base de datos para aplicación de comida rápida
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS fastfood_db;
USE fastfood_db;

-- Tabla de productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria ENUM('hamburguesa', 'papas', 'bebida', 'postre') NOT NULL,
    imagen VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas
CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') NOT NULL,
    estado ENUM('pendiente', 'preparando', 'listo', 'entregado') DEFAULT 'pendiente',
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

-- Tabla de detalle de ventas (relación muchos a muchos entre ventas y productos)
CREATE TABLE detalle_ventas (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);


INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Hamburguesa Clásica', 'Carne de res, lechuga, tomate, cebolla y salsa especial', 8500.00, 'hamburguesa', 'img/hamburguesa-clasica.jpg'),
('Hamburguesa Doble', 'Doble carne de res con queso cheddar', 12500.00, 'hamburguesa', 'img/hamburguesa-doble.jpg'),
('Hamburguesa BBQ', 'Carne de res con salsa BBQ, cebolla caramelizada y tocino', 10500.00, 'hamburguesa', 'img/hamburguesa-bbq.jpg'),
('Hamburguesa Vegetariana', 'Hamburguesa de lentejas con vegetales frescos', 7500.00, 'hamburguesa', 'img/hamburguesa-veggie.jpg'),
('Papas Fritas Medianas', 'Papas fritas crujientes porción mediana', 4500.00, 'papas', 'img/papas-medianas.jpg'),
('Papas Fritas Grandes', 'Papas fritas crujientes porción grande', 6000.00, 'papas', 'img/papas-grandes.jpg'),
('Papas con Queso', 'Papas fritas con queso cheddar derretido', 7000.00, 'papas', 'img/papas-queso.jpg'),
('Bebidas 500ml', 'Bebida a Eleccion 500ml', 2500.00, 'bebida', 'img/coca-cola.jpg'),
('Agua Natural', 'Agua purificada 600ml', 1500.00, 'bebida', 'img/agua.jpg'),
('Jugo Natural', 'Jugo de frutas naturales 400ml', 3000.00, 'bebida', 'img/jugo.jpg'),
('Helado de Vainilla', 'Helado cremoso de vainilla', 3500.00, 'postre', 'img/helado-vainilla.jpg'),
('Brownie con Helado', 'Brownie de chocolate caliente con helado', 4500.00, 'postre', 'img/brownie.jpg');

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, telefono, email, direccion) VALUES
('Juan Pérez', '+56 9 1234 5678', 'juan@email.com', 'Providencia 123, Santiago'),
('María García', '+56 9 8765 4321', 'maria@email.com', 'Las Condes 456, Santiago'),
('Carlos López', '+56 9 5555 0123', 'carlos@email.com', 'Ñuñoa 789, Santiago');
