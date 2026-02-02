document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // URL de tu servidor en Render
    const BASE_URL = 'https://le-parfum-backend.onrender.com';
    
    // Selectores principales
    const bloques = document.querySelectorAll('.bloque-confirmacion');
    const productosContainer = bloques[0];
    const infoDireccion = bloques[1].querySelector('.info-texto');
    const infoPago = bloques[2].querySelector('.info-texto');

    if (!token) { window.location.href = 'login.html'; return; }

    // --- 1. CARGAR DATOS INICIALES ---
    const cargarResumen = async () => {
        try {
            const resCart = await fetch(`${BASE_URL}/api/carrito-usuario`, {
                headers: { 'Authorization': token }
            });
            const productos = await resCart.json();

            const resPerfil = await fetch(`${BASE_URL}/api/perfil`, {
                headers: { 'Authorization': token }
            });
            const usuario = await resPerfil.json();

            renderizarTodo(productos, usuario);
        } catch (error) {
            console.error("Error al cargar resumen:", error);
        }
    };

    const renderizarTodo = (productos, usuario) => {
        const htmlProductos = productos.map(p => `
            <div class="producto-confirmacion">
                <span>${p.nombre} (x${p.cantidad})</span>
                <span>$${(p.precio * p.cantidad).toLocaleString()} MXN</span>
            </div>
        `).join('');
        productosContainer.innerHTML = `<h3>Productos</h3>` + htmlProductos;

        infoDireccion.innerHTML = `
            <strong>${usuario.nombre_usuario}</strong><br>
            ${usuario.direccion || 'Calle Ejemplo 123, Col. Centro'}<br>
            México
        `;

        const subtotal = productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const envio = 150;
        const total = subtotal + envio;

        document.querySelector('.linea-total:nth-child(1) span:last-child').innerText = `$${subtotal.toLocaleString()} MXN`;
        document.querySelector('.linea-total.final span:last-child').innerText = `$${total.toLocaleString()} MXN`;
    };

    // --- 2. LÓGICA DE EDICIÓN TEMPORAL ---
    const inputsDireccion = bloques[1].querySelectorAll('.editar-form input');
    
    const actualizarDireccionVisual = () => {
        const nombre = inputsDireccion[0].value || "Nombre";
        const calle = inputsDireccion[1].value || "Calle y número";
        const colonia = inputsDireccion[2].value || "Colonia";
        const ciudad = inputsDireccion[3].value || "Ciudad";
        const cp = inputsDireccion[4].value || "CP";

        infoDireccion.innerHTML = `
            <strong>${nombre}</strong><br>
            ${calle}<br>
            ${colonia}<br>
            ${ciudad}, CP: ${cp}
        `;
    };

    inputsDireccion.forEach(input => input.addEventListener('input', actualizarDireccionVisual));

    const selectMetodo = bloques[2].querySelector('select');
    const inputTarjeta = bloques[2].querySelector('input[placeholder="Número de tarjeta"]');

    const actualizarPagoVisual = () => {
        const metodo = selectMetodo.value;
        const num = inputTarjeta.value;
        const terminacion = num.length >= 4 ? `**** ${num.slice(-4)}` : "**** 0000";
        
        infoPago.innerHTML = `
            ${metodo}<br>
            Terminación ${terminacion}
        `;
    };

    selectMetodo.addEventListener('change', actualizarPagoVisual);
    inputTarjeta.addEventListener('input', actualizarPagoVisual);

    // --- 3. CONFIRMAR COMPRA (CON GUARDADO EN TABLA PEDIDOS) ---
    const btnConfirmar = document.querySelector('.btn-principal');
    btnConfirmar.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const totalTexto = document.querySelector('.linea-total.final span:last-child').innerText;
        const totalNumerico = parseFloat(totalTexto.replace(/[^0-9.-]+/g, ""));

        if (confirm("¿Deseas finalizar tu compra con estos datos?")) {
            try {
                // PASO A: Guardar el registro en la tabla 'pedidos' del Backend
                const resPedido = await fetch(`${BASE_URL}/api/pedidos`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token 
                    },
                    body: JSON.stringify({ total: totalNumerico })
                });
                
                const datosPedido = await resPedido.json();

                if (resPedido.ok) {
                    // PASO B: Si el pedido se guardó, vaciamos el carrito
                    await fetch(`${BASE_URL}/api/carrito-vaciar`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token }
                    });

                    localStorage.setItem('ultimo_pedido', datosPedido.codigo);
                    window.location.href = 'compra-exitosa.html'; 
                } else {
                    alert("Error al registrar el pedido en la base de datos.");
                }
            } catch (error) {
                console.error(error);
                alert("Error de conexión con el servidor.");
            }
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    cargarResumen();
});
