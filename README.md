# FastFood Express

Proyecto web simple para una tienda de comida rápida (frontend estático + PHP para backend ligero y almacenamiento MySQL).

## Resumen
Interfaz de pedidos y administración básica. Archivos principales:
- Páginas: `index.html`, `admin.html`, `historial.html`
- Backend PHP: `php/config.php`, `php/productos.php`, `php/ventas.php`, `php/admin-productos.php`
- Estilos: `css/styles.css`
- Scripts: `js/app.js`, `js/admin.js`, `js/historial.js`
- Imágenes: `img/`
- Base de datos SQL: `database/fastfood_db_clp.sql`

## Requisitos
- XAMPP (Apache + MySQL) instalado en Windows
- Navegador moderno
- PHP 7.0+ (incluido en XAMPP)

## Instalación y ejecución (rápido)
1. Copia la carpeta del proyecto dentro de la carpeta `htdocs` de XAMPP, por ejemplo:

   C:\\xampp\\htdocs\\fastfood-express

2. Inicia Apache y MySQL desde el panel de control de XAMPP.

3. Importa la base de datos:
   - Usando phpMyAdmin: abre `http://localhost/phpmyadmin`, crea una base de datos (por ejemplo `fastfood_db_clp`) y usa la pestaña "Importar" para subir `database/fastfood_db_clp.sql`.
   - O usando línea de comandos (cmd.exe):

```bat
mysql -u root -p fastfood_db_clp < "C:\\xampp\\htdocs\\fastfood-express\\database\\fastfood_db_clp.sql"
```

(Usa el usuario/contraseña que tengas configurado para MySQL; por defecto XAMPP suele usar `root` sin contraseña.)

4. Actualiza la configuración de conexión a la base de datos si es necesario en `php/config.php` (host, usuario, contraseña, nombre de base de datos).

5. Abre la app en el navegador:

```
http://localhost/fastfood-express/
```

Acceso a administración (página local):

```
http://localhost/fastfood-express/admin.html
```

Historial de ventas:

```
http://localhost/fastfood-express/historial.html
```

## Estructura de carpetas
- `index.html` — Página principal (pedido)
- `admin.html` — Interfaz de administración (productos)
- `historial.html` — Visualización de ventas/historial
- `css/` — Estilos
- `js/` — Lógica cliente (añadir al carrito, envíos AJAX)
- `php/` — Endpoints PHP que manejan productos y ventas
- `img/` — Recursos de imágenes
- `database/fastfood_db_clp.sql` — Dump para crear tablas y datos iniciales



## Contribuir
1. Crea un fork o copia del proyecto.
2. Haz cambios en una rama nueva.
3. Envía un pull request con descripción de cambios.

---


