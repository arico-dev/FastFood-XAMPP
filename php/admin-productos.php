<?php
require_once 'config.php';

function validarDatosProducto($datosProducto) {
    $errores = [];
    
    // Validar nombre
    if (empty($datosProducto['nombre'])) {
        $errores[] = "El nombre es requerido";
    } elseif (strlen($datosProducto['nombre']) < 3) {
        $errores[] = "El nombre debe tener al menos 3 caracteres";
    }
    
    // Validar descripción
    if (empty($datosProducto['descripcion'])) {
        $errores[] = "La descripción es requerida";
    } elseif (strlen($datosProducto['descripcion']) < 10) {
        $errores[] = "La descripción debe tener al menos 10 caracteres";
    }
    
    // Validar precio
    if (!isset($datosProducto['precio']) || $datosProducto['precio'] <= 0) {
        $errores[] = "El precio debe ser mayor a 0";
    }
    
    // Validar categoría
    $categoriasValidas = ['hamburguesa', 'papas', 'bebida', 'postre'];
    if (empty($datosProducto['categoria']) || !in_array($datosProducto['categoria'], $categoriasValidas)) {
        $errores[] = "Debe seleccionar una categoría válida";
    }
    
    // Validar imagen (opcional)
    if (!empty($datosProducto['imagen']) && !filter_var($datosProducto['imagen'], FILTER_VALIDATE_URL)) {
        // Si no es URL válida, verificar si es ruta local válida
        if (!preg_match('/^img\/[a-zA-Z0-9\-_\.]+\.(jpg|jpeg|png|gif|webp)$/i', $datosProducto['imagen'])) {
            $errores[] = "La imagen debe ser una URL válida o una ruta local válida (img/archivo.jpg)";
        }
    }
    
    return $errores;
}

// Crear nuevo producto
function crearProducto($datosProducto) {
    $errores = validarDatosProducto($datosProducto);
    if (!empty($errores)) {
        return ['success' => false, 'errors' => $errores];
    }
    
    $pdo = getConnection();
    
    try {
        $sql = "INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, disponible) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $datosProducto['nombre'],
            $datosProducto['descripcion'],
            $datosProducto['precio'],
            $datosProducto['categoria'],
            $datosProducto['imagen'] ?: null,
            $datosProducto['disponible'] ? 1 : 0
        ]);
        
        return ['success' => true, 'id_producto' => $pdo->lastInsertId()];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Actualizar producto existente
function actualizarProducto($datosProducto) {
    $errores = validarDatosProducto($datosProducto);
    if (!empty($errores)) {
        return ['success' => false, 'errors' => $errores];
    }
    
    if (empty($datosProducto['id_producto'])) {
        return ['success' => false, 'error' => 'ID de producto requerido para actualizar'];
    }
    
    $pdo = getConnection();
    
    try {
        // Verificar que el producto existe
        $sqlVerificar = "SELECT id_producto FROM productos WHERE id_producto = ?";
        $stmtVerificar = $pdo->prepare($sqlVerificar);
        $stmtVerificar->execute([$datosProducto['id_producto']]);
        
        if (!$stmtVerificar->fetch()) {
            return ['success' => false, 'error' => 'Producto no encontrado'];
        }
        
        $sql = "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, imagen = ?, disponible = ? WHERE id_producto = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $datosProducto['nombre'],
            $datosProducto['descripcion'],
            $datosProducto['precio'],
            $datosProducto['categoria'],
            $datosProducto['imagen'] ?: null,
            $datosProducto['disponible'] ? 1 : 0,
            $datosProducto['id_producto']
        ]);
        
        return ['success' => true, 'id_producto' => $datosProducto['id_producto']];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Eliminar producto
function eliminarProducto($idProducto) {
    if (empty($idProducto)) {
        return ['success' => false, 'error' => 'ID de producto requerido'];
    }
    
    $pdo = getConnection();
    
    try {
        // Verificar que el producto existe
        $sqlVerificar = "SELECT id_producto FROM productos WHERE id_producto = ?";
        $stmtVerificar = $pdo->prepare($sqlVerificar);
        $stmtVerificar->execute([$idProducto]);
        
        if (!$stmtVerificar->fetch()) {
            return ['success' => false, 'error' => 'Producto no encontrado'];
        }
        
        // Verificar si el producto tiene ventas asociadas
        $sqlVentas = "SELECT COUNT(*) as total FROM detalle_ventas WHERE id_producto = ?";
        $stmtVentas = $pdo->prepare($sqlVentas);
        $stmtVentas->execute([$idProducto]);
        $ventasAsociadas = $stmtVentas->fetch()['total'];
        
        if ($ventasAsociadas > 0) {
            // Si tiene ventas, solo marcarlo como no disponible en lugar de eliminarlo
            $sqlDesactivar = "UPDATE productos SET disponible = 0 WHERE id_producto = ?";
            $stmtDesactivar = $pdo->prepare($sqlDesactivar);
            $stmtDesactivar->execute([$idProducto]);
            
            return ['success' => true, 'message' => 'Producto desactivado (tiene ventas asociadas)'];
        } else {
            // Si no tiene ventas, eliminarlo completamente
            $sql = "DELETE FROM productos WHERE id_producto = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$idProducto]);
            
            return ['success' => true, 'message' => 'Producto eliminado completamente'];
        }
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Obtener todos los productos (incluyendo no disponibles para administración)
function obtenerTodosLosProductos() {
    $sql = "SELECT * FROM productos ORDER BY fecha_creacion DESC";
    $stmt = executeQuery($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// API endpoints
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener todos los productos
    $productos = obtenerTodosLosProductos();
    echo json_encode($productos);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Crear nuevo producto
    $input = json_decode(file_get_contents('php://input'), true);
    $resultado = crearProducto($input);
    echo json_encode($resultado);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Actualizar producto existente
    $input = json_decode(file_get_contents('php://input'), true);
    $resultado = actualizarProducto($input);
    echo json_encode($resultado);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Eliminar producto
    $input = json_decode(file_get_contents('php://input'), true);
    $resultado = eliminarProducto($input['id_producto']);
    echo json_encode($resultado);
    
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>
