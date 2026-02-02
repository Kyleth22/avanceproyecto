document.addEventListener('DOMContentLoaded', async () => {
    const contenedorProductos = document.querySelector('.carrito-productos');
    const token = localStorage.getItem('token');
    const costoEnvio = 150;
    // URL de tu servidor en Render
    const BASE_URL = 'https://le-parfum-backend.onrender.com';

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // --- 1. CARGAR PRODUCTOS DESDE EL BACKEND ---
    const cargarCarrito = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/carrito-usuario`, {
                headers: { 'Authorization': token }
            });
            const productos = await res.json();
            renderizarCarrito(productos);
        } catch (error) {
            console.error("Error al cargar carrito:", error);
        }
    };

    const renderizarCarrito = (productos) => {
        if (productos.length === 0) {
            contenedorProductos.innerHTML = `<p style="text-align: center; color: white;">Tu carrito está vacío.</p>`;
            actualizarTotales();
            return;
        }

        contenedorProductos.innerHTML = productos.map(p => `
            <div class="item-carrito" data-id="${p.producto_id}">
                <img src="../img/${p.imagen_url}" alt="${p.nombre}">
                <div class="info-item">
                    <h3>${p.nombre}</h3>
                    <p class="precio">$${p.precio} MXN</p>
                </div>
                <div class="cantidad">
                    <button class="btn-restar">-</button>
                    <span>${p.cantidad}</span>
                    <button class="btn-sumar">+</button>
                </div>
                <div class="subtotal">$${(p.precio * p.cantidad).toLocaleString()} MXN</div>
                <button class="eliminar">✕</button>
            </div>
        `).join('');
        actualizarTotales();
    };

    // --- 2. ACTUALIZAR TOTALES VISUALES ---
    function actualizarTotales() {
        let subtotalGeneral = 0;
        const items = document.querySelectorAll('.item-carrito');

        items.forEach(item => {
            const precioText = item.querySelector('.precio').innerText.replace(/[^0-9.-]+/g, "");
            const precioUnitario = parseFloat(precioText);
            const cantidad = parseInt(item.querySelector('.cantidad span').innerText);
            subtotalGeneral += (precioUnitario * cantidad);
        });

        const totalFinal = subtotalGeneral > 0 ? subtotalGeneral + costoEnvio : 0;
        
        document.querySelector('.resumen-linea:nth-child(2) span:last-child').innerText = `$${subtotalGeneral.toLocaleString()} MXN`;
        document.querySelector('.resumen-total span:last-child').innerText = `$${totalFinal.toLocaleString()} MXN`;
    }

    // --- 3. GESTIÓN DE EVENTOS (Sumar, Restar, Eliminar) ---
    contenedorProductos.addEventListener('click', async (e) => {
        const tarjeta = e.target.closest('.item-carrito');
        if (!tarjeta) return;
        const productoId = tarjeta.dataset.id;
        const spanCantidad = tarjeta.querySelector('.cantidad span');
        let cantidadActual = parseInt(spanCantidad.innerText);

        // Sumar o Restar
        if (e.target.classList.contains('btn-sumar') || e.target.classList.contains('btn-restar')) {
            const nuevaCantidad = e.target.classList.contains('btn-sumar') ? cantidadActual + 1 : cantidadActual - 1;
            if (nuevaCantidad < 1) return;

            try {
                const res = await fetch(`${BASE_URL}/api/carrito/cantidad`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ producto_id: productoId, cantidad: nuevaCantidad })
                });
                if (res.ok) {
                    spanCantidad.innerText = nuevaCantidad;
                    cargarCarrito(); // Recargamos para actualizar subtotales
                }
            } catch (error) { console.error(error); }
        }

        // Eliminar
        if (e.target.classList.contains('eliminar')) {
            if (!confirm("¿Eliminar producto?")) return;
            try {
                await fetch(`${BASE_URL}/api/carrito/${productoId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': token }
                });
                cargarCarrito();
            } catch (error) { console.error(error); }
        }
    });

    // --- 4. CERRAR SESIÓN ---
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });

    cargarCarrito();
});
