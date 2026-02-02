document.addEventListener('DOMContentLoaded', async () => {
    const gridDeseos = document.getElementById('grid-deseos');
    const token = localStorage.getItem('token');
    
    // URL de tu servidor en Render
    const BASE_URL = 'https://le-parfum-backend.onrender.com';

    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            localStorage.clear(); 
            alert("Has cerrado sesión correctamente.");
            window.location.href = 'index.html'; 
        });
    }

    // --- 1. CARGAR PRODUCTOS DE LA LISTA DE DESEOS ---
    const cargarDeseos = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/deseos-usuario`, {
                headers: { 'Authorization': token }
            });
            const productos = await res.json();

            renderizarDeseos(productos);
        } catch (error) {
            console.error("Error cargando deseos:", error);
        }
    };

    // --- 2. RENDERIZAR EN EL HTML ---
    const renderizarDeseos = (productos) => {
        if (productos.length === 0) {
            gridDeseos.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: white;">Tu lista está vacía.</p>`;
            return;
        }

        gridDeseos.innerHTML = productos.map(p => `
            <div class="caja_perfume" data-id="${p.id}">
                <img src="../img/${p.imagen_url}" alt="${p.nombre}">
                <h3>${p.nombre}</h3>
                <p>$${p.precio.toLocaleString('es-MX')} MXN</p>
                <div class="acciones-producto">
                    <button class="btn-comprar" onclick="agregarAlCarrito(${p.id})">Agregar al carrito</button>
                    <button class="btn-eliminar" onclick="quitarDeDeseos(${p.id})">Quitar de la lista</button>
                </div>
            </div>
        `).join('');
    };

    // --- 3. ACCIÓN: QUITAR DE DESEOS ---
    window.quitarDeDeseos = async (id) => {
        if (!confirm("¿Quitar de tu lista de favoritos?")) return;

        try {
            const res = await fetch(`${BASE_URL}/api/deseos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });

            if (res.ok) {
                cargarDeseos(); 
            }
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    // --- 4. ACCIÓN: AGREGAR AL CARRITO ---
    window.agregarAlCarrito = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/carrito`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token 
                },
                body: JSON.stringify({ producto_id: id })
            });

            if (res.ok) alert("¡Producto movido al carrito!");
        } catch (error) {
            console.error(error);
        }
    };

    cargarDeseos();
});
