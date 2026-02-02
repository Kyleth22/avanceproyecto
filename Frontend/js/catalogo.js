/**
 * Lógica para el Catálogo - LE PARFUM
 */

// Sincronización de sesión entre pestañas
window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) window.location.reload();
});

document.addEventListener('DOMContentLoaded', async () => {
    const listaProductos = document.getElementById('lista-productos');
    const filtroMarca = document.getElementById('filtro-marca');
    const filtroPrecio = document.getElementById('filtro-precio');
    const authContainer = document.getElementById('auth-container');
    
    let productosGlobales = [];

    // 1. GESTIÓN DE HEADER Y SESIÓN
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');

    if (token && usuarioData) {
        const usuario = JSON.parse(usuarioData);
        authContainer.innerHTML = `
            <span style="color: white; margin-right: 15px;">Hola, <strong>${usuario.nombre}</strong></span>
            <a href="perfil.html">Mi Perfil</a>
            <a href="#" id="logout-btn">Cerrar sesión</a>
        `;
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "index.html";
        });
    }

    // 2. FUNCIÓN PARA LLENAR FILTRO DE MARCAS
    const llenarFiltroMarcas = (productos) => {
        const marcas = [...new Set(productos.map(p => p.marca))];
        // Limpiar excepto la primera opción
        filtroMarca.innerHTML = '<option value="todos">Todas las Marcas</option>';
        marcas.sort().forEach(marca => {
            if (marca) {
                const opt = document.createElement('option');
                opt.value = marca;
                opt.textContent = marca;
                filtroMarca.appendChild(opt);
            }
        });
    };

    // 3. FUNCIÓN PARA MOSTRAR PRODUCTOS (RENDER)
    const renderizar = (productos) => {
        listaProductos.innerHTML = '';
        if (productos.length === 0) {
            listaProductos.innerHTML = '<p style="color: white; width: 100%; text-align: center;">No se encontraron perfumes.</p>';
            return;
        }

        productos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'caja_perfume';
            card.innerHTML = `
                <img src="../img/${p.imagen_url}" alt="${p.nombre}" onerror="this.src='../img/default.png'">
                <h3>${p.nombre}</h3>
                <p>$${p.precio.toLocaleString('es-MX')} MXN</p>
                <div class="acciones-producto">
                    <button class="btn-carrito" data-id="${p.id}">AGREGAR AL CARRITO</button>
                    <button class="btn-deseo" data-id="${p.id}">AÑADIR A DESEOS</button>
                </div>
            `;
            listaProductos.appendChild(card);
        });

        vincularAcciones();
    };

    // 4. VINCULAR CLICS A BASE DE DATOS
    const vincularAcciones = () => {
        const tokenActual = localStorage.getItem('token');

        // Lógica Carrito
        document.querySelectorAll('.btn-carrito').forEach(boton => {
            boton.onclick = async (e) => {
                if (!tokenActual) return alert("Inicia sesión para agregar al carrito");
                const productoId = e.currentTarget.getAttribute('data-id');

                try {
                    const res = await fetch('http://localhost:3000/api/carrito', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': tokenActual 
                        },
                        body: JSON.stringify({ producto_id: productoId })
                    });
                    const data = await res.json();
                    if (res.ok) alert(data.message || "¡Añadido al carrito!");
                } catch (err) { console.error("Error en carrito:", err); }
            };
        });

        // Lógica Lista de Deseos
        document.querySelectorAll('.btn-deseo').forEach(boton => {
            boton.onclick = async (e) => {
                if (!tokenActual) return alert("Inicia sesión para guardar deseos");
                const productoId = e.currentTarget.getAttribute('data-id');
                const btn = e.currentTarget;

                try {
                    const res = await fetch('http://localhost:3000/api/deseos', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': tokenActual 
                        },
                        body: JSON.stringify({ producto_id: productoId })
                    });
                    
                    const data = await res.json();

                    if (res.ok) {
                        btn.innerText = "❤️ EN TU LISTA";
                        btn.style.background = "#e74c3c"; // Color rojo para deseos
                        btn.disabled = true; // Evita múltiples clics
                    } else {
                        console.error("Error del servidor:", data);
                    }
                } catch (err) { 
                    console.error("Error en la petición de deseos:", err); 
                }
            };
        });
    };

    // 5. LÓGICA DE FILTRADO
    const aplicarFiltros = () => {
        const marca = filtroMarca.value;
        const precio = filtroPrecio.value;

        const filtrados = productosGlobales.filter(p => {
            const cumpleMarca = (marca === 'todos' || p.marca === marca);
            let cumplePrecio = true;
            if (precio === 'bajo') cumplePrecio = p.precio < 1000;
            if (precio === 'medio') cumplePrecio = p.precio >= 1000 && p.precio <= 2000;
            if (precio === 'alto') cumplePrecio = p.precio > 2000;
            return cumpleMarca && cumplePrecio;
        });
        renderizar(filtrados);
    };

    filtroMarca.addEventListener('change', aplicarFiltros);
    filtroPrecio.addEventListener('change', aplicarFiltros);

    // 6. CARGA INICIAL
    try {
        const res = await fetch('http://localhost:3000/api/productos');
        productosGlobales = await res.json();
        llenarFiltroMarcas(productosGlobales);
        renderizar(productosGlobales);
    } catch (error) {
        listaProductos.innerHTML = '<p style="color: red; text-align:center;">Error de conexión.</p>';
    }
});