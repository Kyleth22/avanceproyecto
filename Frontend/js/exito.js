document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar el número de pedido real que guardamos en la página anterior
    const pedidoDisplay = document.getElementById('pedido-id');
    const ultimoPedido = localStorage.getItem('ultimo_pedido');

    if (ultimoPedido && pedidoDisplay) {
        pedidoDisplay.innerText = `#${ultimoPedido}`;
        // Lo mantenemos en el storage por si refresca la página, 
        // pero podrías borrarlo al salir de aquí si prefieres.
    }

    // 2. Lógica para que el botón "Cerrar sesión" funcione en esta página
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); // Borra el token y el ID del pedido
            window.location.href = 'index.html';
        });
    }
});