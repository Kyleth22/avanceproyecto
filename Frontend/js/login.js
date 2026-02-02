document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    
    // URL de tu servidor en Render
    const BASE_URL = 'https://le-parfum-backend.onrender.com';

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const correo = document.getElementById('login-correo').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                // Petición al servidor de Render en lugar de localhost
                const respuesta = await fetch(`${BASE_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password })
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    // GUARDAR SESIÓN: Guardamos el token y datos básicos en el navegador
                    localStorage.setItem('token', resultado.token);
                    localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

                    alert(`¡Bienvenido de nuevo, ${resultado.usuario.nombre}!`);
                    // Redirigimos al inicio una vez logueado
                    window.location.href = "index.html";
                } else {
                    alert(resultado.message);
                }

            } catch (error) {
                console.error("Error en el login:", error);
                alert("Error al conectar con el servidor de Render. Verifica que el backend esté activo.");
            }
        });
    }
});
