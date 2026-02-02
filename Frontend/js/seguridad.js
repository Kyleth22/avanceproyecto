document.addEventListener('DOMContentLoaded', () => {
    const formPassword = document.getElementById('form-password');
    const token = localStorage.getItem('token');

    formPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        const actual = document.getElementById('pass-actual').value;
        const nueva = document.getElementById('pass-nueva').value;
        const confirmar = document.getElementById('pass-confirmar').value;

        if (nueva !== confirmar) return alert("Las contraseñas no coinciden");
        if (nueva.length < 8) return alert("Mínimo 8 caracteres");

        try {
            const res = await fetch('http://localhost:3000/api/cambiar-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ passwordActual: actual, passwordNueva: nueva })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Contraseña actualizada con éxito");
                window.location.href = "perfil.html";
            } else {
                alert(data.message);
            }
        } catch (err) { alert("Error al conectar con el servidor"); }
    });
});