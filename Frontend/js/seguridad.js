document.addEventListener('DOMContentLoaded', () => {
    const formPassword = document.getElementById('form-password');
    const token = localStorage.getItem('token');
    
    // URL de tu servidor en Render
    const BASE_URL = 'https://le-parfum-backend.onrender.com';

    if (!formPassword) return;

    formPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        const actual = document.getElementById('pass-actual').value;
        const nueva = document.getElementById('pass-nueva').value;
        const confirmar = document.getElementById('pass-confirmar').value;

        if (nueva !== confirmar) return alert("Las contraseñas nuevas no coinciden");
        if (nueva.length < 8) return alert("La nueva contraseña debe tener al menos 8 caracteres");

        try {
            // Petición PUT al endpoint de Render
            const res = await fetch(`${BASE_URL}/api/cambiar-password`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': token 
                },
                body: JSON.stringify({ passwordActual: actual, passwordNueva: nueva })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Contraseña actualizada con éxito");
                window.location.href = "perfil.html";
            } else {
                alert(data.message || "Error al actualizar");
            }
        } catch (err) { 
            console.error("Error en cambio de password:", err);
            alert("Error al conectar con el servidor de Render"); 
        }
    });
});
