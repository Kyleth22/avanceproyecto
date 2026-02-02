
//SINCRONIZACIÓN GLOBAL
// Si cierras sesión en la pestaña de Perfil, esta pestaña de Index se limpia sola.
window.addEventListener('storage', (event) => {
    if (event.key === 'token' && !event.newValue) {
        window.location.reload(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    //LÓGICA DE ESTADO DE SESIÓN
    const authContainer = document.querySelector('.auth-links');
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');

    if (token && usuarioData && authContainer) {
        const usuario = JSON.parse(usuarioData);
        
        authContainer.innerHTML = `
            <span style="color: white; margin-right: 15px;">Bienvenido, <strong>${usuario.nombre}</strong></span>
            <a href="perfil.html">Mi Perfil</a>
            <a href="#" id="logout-btn-index">Cerrar sesión</a>
        `;

        document.getElementById('logout-btn-index').addEventListener('click', (e) => {
            e.preventDefault();
            
            //Acción de cerrar sesión
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            alert("Has cerrado sesión correctamente.");
            
            window.location.href = "index.html"; 
        });
    }

    //LÓGICA DEL FORMULARIO DE RECOMENDACIONES
    const formRecomendacion = document.getElementById('form-recomendacion');
    if (formRecomendacion) {
        formRecomendacion.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datos = {
                nombre: document.getElementById('nombre').value.trim(),
                correo: document.getElementById('correo').value.trim(),
                tipo: document.getElementById('tipo').value,
                mensaje: document.getElementById('mensaje').value.trim()
            };

            try {
                const respuesta = await fetch('http://localhost:3000/api/recomendaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    alert(`¡Gracias ${datos.nombre}! Tu recomendación ha sido recibida.`);
                    formRecomendacion.reset();
                } else {
                    alert('Error al enviar: ' + resultado.message);
                }
            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
                alert('No se pudo conectar con el servidor.');
            }
        });
    }
});