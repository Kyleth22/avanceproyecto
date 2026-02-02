document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const correo = document.getElementById('login-correo').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const respuesta = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password })
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    // GUARDAR SESIÓN: Guardamos el token y datos básicos
                    localStorage.setItem('token', resultado.token);
                    localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

                    alert(`¡Bienvenido de nuevo, ${resultado.usuario.nombre}!`);
                    window.location.href = "index.html";
                } else {
                    alert(resultado.message);
                }

            } catch (error) {
                console.error("Error en el login:", error);
                alert("Error al conectar con el servidor.");
            }
        });
    }
});