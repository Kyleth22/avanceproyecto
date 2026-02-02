document.addEventListener('DOMContentLoaded', () => {
    const formRegistro = document.getElementById('form-registro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Captura de datos
            const usuario = document.getElementById('reg-usuario').value.trim();
            const correo = document.getElementById('reg-correo').value.trim();
            const password = document.getElementById('reg-password').value;
            const direccion = document.getElementById('reg-direccion').value.trim();

            // 2. Validación básica
            if (password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            try {
                // 3. Envío al Backend real
                const respuesta = await fetch('http://localhost:3000/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario, correo, password, direccion })
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    alert(`¡Bienvenido, ${usuario}! Tu cuenta ha sido creada exitosamente.`);
                    window.location.href = "login.html";
                } else {
                    alert(resultado.message || "Error al registrar usuario");
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                alert("No se pudo conectar con el servidor.");
            }
        });
    }
});