<?php
require_once 'config.php';

function validarDatosVenta($datosVenta) {
    $errores = [];
    
    // Validar datos del cliente
    if (isset($datosVenta['cliente'])) {
        $cliente = $datosVenta['cliente'];
        
        // Validar nombre: solo letras, espacios y acentos
        if (empty($cliente['nombre'])) {
            $errores[] = "El nombre es requerido";
        } elseif (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/', $cliente['nombre'])) {
            $errores[] = "El nombre solo puede contener letras y espacios";
        }
        
        // Validar teléfono: formato chileno +569xxxxxxxx o 9xxxxxxxx
        if (empty($cliente['telefono'])) {
            $errores[] = "El teléfono es requerido";
        } elseif (!preg_match('/^(\+569|9)\d{8}$/', $cliente['telefono'])) {
            $errores[] = "El teléfono debe tener formato +569xxxxxxxx o 9xxxxxxxx";
        }
        
        // Validar email si se proporciona
        if (!empty($cliente['email']) && !filter_var($cliente['email'], FILTER_VALIDATE_EMAIL)) {
            $errores[] = "El formato del email no es válido";
        }
    }
    
    // Validar método de pago
    if (empty($datosVenta['metodo_pago'])) {
        $errores[] = "El método de pago es requerido";
    } elseif (!in_array($datosVenta['metodo_pago'], ['efectivo', 'tarjeta', 'transferencia'])) {
        $errores[] = "Método de pago no válido";
    }
    
    // Validar productos
    if (empty($datosVenta['productos']) || !is_array($datosVenta['productos'])) {
        $errores[] = "Debe incluir al menos un producto";
    }
    
    return $errores;
}

// Procesar nueva venta con integridad referencial
function procesarVenta($datosVenta) {
    $errores = validarDatosVenta($datosVenta);
    if (!empty($errores)) {
        return ['success' => false, 'errors' => $errores];
    }
    
    $pdo = getConnection();
    
    try {
        // Iniciar transacción
        $pdo->beginTransaction();
        
        // 1. Insertar o buscar cliente
        $clienteId = insertarOBuscarCliente($pdo, $datosVenta['cliente']);
        
        // 2. Insertar venta
        $sqlVenta = "INSERT INTO ventas (id_cliente, total, metodo_pago) VALUES (?, ?, ?)";
        $stmtVenta = $pdo->prepare($sqlVenta);
        $stmtVenta->execute([$clienteId, $datosVenta['total'], $datosVenta['metodo_pago']]);
        $ventaId = $pdo->lastInsertId();
        
        // 3. Insertar detalles de venta
        foreach ($datosVenta['productos'] as $producto) {
            $sqlDetalle = "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)";
            $stmtDetalle = $pdo->prepare($sqlDetalle);
            $subtotal = $producto['cantidad'] * $producto['precio'];
            $stmtDetalle->execute([$ventaId, $producto['id'], $producto['cantidad'], $producto['precio'], $subtotal]);
        }
        
        // Confirmar transacción
        $pdo->commit();
        return ['success' => true, 'venta_id' => $ventaId];
        
    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $pdo->rollBack();
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function insertarOBuscarCliente($pdo, $datosCliente) {
    // Buscar cliente existente por teléfono
    $sqlBuscar = "SELECT id_cliente FROM clientes WHERE telefono = ?";
    $stmtBuscar = $pdo->prepare($sqlBuscar);
    $stmtBuscar->execute([$datosCliente['telefono']]);
    $cliente = $stmtBuscar->fetch();
    
    if ($cliente) {
        return $cliente['id_cliente'];
    } else {
        // Insertar nuevo cliente
        $sqlInsertar = "INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)";
        $stmtInsertar = $pdo->prepare($sqlInsertar);
        $stmtInsertar->execute([
            $datosCliente['nombre'],
            $datosCliente['telefono'],
            $datosCliente['email'] ?? null,
            $datosCliente['direccion'] ?? null
        ]);
        return $pdo->lastInsertId();
    }
}

// Obtener historial de ventas
function obtenerHistorialVentas() {
    $sql = "SELECT v.*, c.nombre as cliente_nombre, c.telefono 
            FROM ventas v 
            JOIN clientes c ON v.id_cliente = c.id_cliente 
            ORDER BY v.fecha_venta DESC";
    $stmt = executeQuery($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// API endpoints
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true);
    
    $resultado = procesarVenta($input);
    echo json_encode($resultado);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    $ventas = obtenerHistorialVentas();
    echo json_encode($ventas);
}
?>
