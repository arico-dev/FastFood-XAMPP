<?php
require_once 'config.php';

// Obtener todos los productos disponibles
function obtenerProductos() {
    $sql = "SELECT * FROM productos WHERE disponible = 1 ORDER BY categoria, nombre";
    $stmt = executeQuery($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Obtener producto por ID
function obtenerProductoPorId($id) {
    $sql = "SELECT * FROM productos WHERE id_producto = ? AND disponible = 1";
    $stmt = executeQuery($sql, [$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// API endpoint para obtener productos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    
    if (isset($_GET['id'])) {
        $producto = obtenerProductoPorId($_GET['id']);
        echo json_encode($producto);
    } else {
        $productos = obtenerProductos();
        echo json_encode($productos);
    }
}
?>
